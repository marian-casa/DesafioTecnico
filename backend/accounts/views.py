from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer

# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

from django.utils import timezone
from datetime import timedelta
import random
from .models import OTPCode

class ForgotPasswordView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objets.get(email=email)
        except User.DoesNotExist:
            return Response ({'message': 'Si el email existe recibiras el codigo.'})
        
        OTPCode.objects.filter(user=user, is_used=False).update(is_used=True)

        code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=10)

        OTPCode.objects.create(user=user, code=code, expires_at=expires_at)

        print(f"\n{'='*40}")
        print(f" OTP para {user.username} ({user.email}): {code}")
        print(f" Válido por 10 minutos")
        print(f"{'='*40}\n")

        return Response({'message:' 'Si el email existe, revibirás el código.'})
    
class VerifyOTPView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        try:
            user = User.objects.get(email=email)
            otp = OTPCode.objects.filter(
                user=user, code=code, is_used=False
            ).latest('created_at')
        except (User.DoesNotExist, OTPCode.DoesNotExist):
            return Response(
                {'error': 'Código inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not otp.is_valid():
            return Response(
                {'error': 'El código expiró'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'message': 'Código válido.', 'email':email})
    

class ResetPasswordView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.get.data('new_password')

        try:
            user = User.objects.get(email=email)
            otp = OTPCode.objects.filter(
                user=user, code=code, is_used=False
            ).latest('created_at')
        except (User.DoesNotExist, OTPCode.DoesNotExist):
            return Response(
                {'error': 'Código Inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not otp.is_valid():
            return Response(
                {'error': 'El código expiró.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        otp.is_used = True
        otp.save()

        return Response ({'message': 'Contraseña actualizada correctamente'})
        

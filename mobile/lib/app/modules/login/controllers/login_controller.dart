import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart' as dio_lib;
import '../../../routes/app_pages.dart';
import '../../../core/utils/api_client.dart';

class LoginController extends GetxController {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final isLoading = false.obs;
  final isPasswordVisible = false.obs;
  final slug = ''.obs;
  final storage = const FlutterSecureStorage();
  final ApiClient apiClient = Get.find<ApiClient>();

  @override
  void onInit() {
    super.onInit();
    if (Get.arguments != null && Get.arguments['slug'] != null) {
      slug.value = Get.arguments['slug'];
    }
  }

  void togglePasswordVisibility() {
    isPasswordVisible.value = !isPasswordVisible.value;
  }

  Future<void> login() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      Get.snackbar('Error', 'Please enter both email and password',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    isLoading.value = true;

    try {
      final response = await apiClient.dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
          'tenantSlug': slug.value,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final role = data['user']['role'];

        await storage.write(key: 'jwt_token', value: token);

        if (role == 'MEMBER') {
          Get.offAllNamed(Routes.MEMBER_HOME);
        } else if (role == 'TENANT_ADMIN') {
          Get.offAllNamed(Routes.ADMIN_HOME);
        } else {
          Get.snackbar('Error', 'Access restricted to members and admins.',
              snackPosition: SnackPosition.BOTTOM);
        }
      }
    } on dio_lib.DioException catch (e) {
      String msg = 'Login failed';
      if (e.response != null && e.response?.data != null) {
        msg = e.response?.data['message'] ?? msg;
      }
      Get.snackbar('Error', msg, snackPosition: SnackPosition.BOTTOM);
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred',
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}

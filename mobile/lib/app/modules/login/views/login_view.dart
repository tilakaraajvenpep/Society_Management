import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/login_controller.dart';

class LoginView extends GetView<LoginController> {
  const LoginView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign In'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 32),
              Obx(() => Text(
                'Welcome to ${controller.slug.value.toUpperCase()}',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              )),
              const SizedBox(height: 8),
              const Text(
                'Sign in to your account',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              TextField(
                controller: controller.emailController,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: Icon(Icons.email),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              Obx(() => TextField(
                controller: controller.passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(
                      controller.isPasswordVisible.value
                          ? Icons.visibility
                          : Icons.visibility_off,
                    ),
                    onPressed: controller.togglePasswordVisibility,
                  ),
                ),
                obscureText: !controller.isPasswordVisible.value,
                onSubmitted: (_) => controller.login(),
              )),
              const SizedBox(height: 32),
              Obx(() => ElevatedButton(
                onPressed: controller.isLoading.value ? null : controller.login,
                child: controller.isLoading.value
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Sign In'),
              )),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => Get.back(),
                child: const Text('Change Society Code'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

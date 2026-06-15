import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/tenant_slug_controller.dart';

class TenantSlugView extends GetView<TenantSlugController> {
  const TenantSlugView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(
                Icons.apartment,
                size: 80,
                color: Color(0xFF2563eb),
              ),
              const SizedBox(height: 24),
              const Text(
                'Welcome to SocietyPro',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Enter your Society Code to continue.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              TextField(
                controller: controller.slugController,
                decoration: const InputDecoration(
                  labelText: 'Society Code (e.g. sunrise)',
                  prefixIcon: Icon(Icons.business),
                ),
                onSubmitted: (_) => controller.continueToLogin(),
              ),
              const SizedBox(height: 24),
              Obx(() => ElevatedButton(
                onPressed: controller.isLoading.value
                    ? null
                    : controller.continueToLogin,
                child: controller.isLoading.value
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Continue'),
              )),
            ],
          ),
        ),
      ),
    );
  }
}

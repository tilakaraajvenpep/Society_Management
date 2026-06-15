import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../routes/app_pages.dart';

class TenantSlugController extends GetxController {
  final slugController = TextEditingController();
  final isLoading = false.obs;
  final storage = const FlutterSecureStorage();

  @override
  void onInit() {
    super.onInit();
    _checkExistingSlug();
  }

  Future<void> _checkExistingSlug() async {
    final slug = await storage.read(key: 'tenant_slug');
    if (slug != null && slug.isNotEmpty) {
      slugController.text = slug;
    }
  }

  Future<void> continueToLogin() async {
    final slug = slugController.text.trim().toLowerCase();
    if (slug.isEmpty) {
      Get.snackbar('Error', 'Please enter a society code',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    isLoading.value = true;
    
    // In v1, we aren't fetching dynamic branding, so we just save the slug
    // and move to the login screen.
    await storage.write(key: 'tenant_slug', value: slug);
    
    isLoading.value = false;
    Get.toNamed(Routes.LOGIN, arguments: {'slug': slug});
  }

  @override
  void onClose() {
    slugController.dispose();
    super.onClose();
  }
}

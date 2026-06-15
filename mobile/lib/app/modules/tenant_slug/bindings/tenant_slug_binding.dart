import 'package:get/get.dart';
import '../controllers/tenant_slug_controller.dart';

class TenantSlugBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TenantSlugController>(
      () => TenantSlugController(),
    );
  }
}

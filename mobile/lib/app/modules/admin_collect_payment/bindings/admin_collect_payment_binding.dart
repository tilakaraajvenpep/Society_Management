import 'package:get/get.dart';
import '../controllers/admin_collect_payment_controller.dart';

class AdminCollectPaymentBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdminCollectPaymentController>(
      () => AdminCollectPaymentController(),
    );
  }
}

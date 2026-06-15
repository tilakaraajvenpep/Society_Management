import 'package:get/get.dart';
import '../controllers/member_payments_controller.dart';

class MemberPaymentsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MemberPaymentsController>(
      () => MemberPaymentsController(),
    );
  }
}

import 'package:get/get.dart';
import '../controllers/member_tickets_controller.dart';

class MemberTicketsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MemberTicketsController>(
      () => MemberTicketsController(),
    );
  }
}

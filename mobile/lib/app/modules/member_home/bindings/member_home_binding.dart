import 'package:get/get.dart';
import '../controllers/member_home_controller.dart';

class MemberHomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MemberHomeController>(
      () => MemberHomeController(),
    );
  }
}

import 'package:get/get.dart';
import '../controllers/admin_members_controller.dart';

class AdminMembersBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AdminMembersController>(
      () => AdminMembersController(),
    );
  }
}

import 'package:get/get.dart';
import '../../../core/utils/api_client.dart';
import 'package:dio/dio.dart' as dio_lib;

class MemberHomeController extends GetxController {
  final ApiClient apiClient = Get.find<ApiClient>();
  final isLoading = true.obs;
  final memberData = {}.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProfile();
  }

  Future<void> fetchProfile() async {
    isLoading.value = true;
    try {
      final response = await apiClient.dio.get('/members/profile');
      if (response.statusCode == 200) {
        memberData.value = response.data;
      }
    } on dio_lib.DioException catch (e) {
      Get.snackbar('Error', 'Failed to load profile data');
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }

  void logout() async {
    await apiClient.storage.delete(key: 'jwt_token');
    Get.offAllNamed('/tenant-slug');
  }
}

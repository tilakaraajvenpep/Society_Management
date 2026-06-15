import 'package:get/get.dart';
import '../../../core/utils/api_client.dart';
import 'package:dio/dio.dart' as dio_lib;

class AdminMembersController extends GetxController {
  final ApiClient apiClient = Get.find<ApiClient>();
  final isLoading = true.obs;
  final members = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchMembers();
  }

  Future<void> fetchMembers() async {
    isLoading.value = true;
    try {
      final response = await apiClient.dio.get('/members');
      if (response.statusCode == 200) {
        members.value = response.data;
      }
    } on dio_lib.DioException catch (e) {
      Get.snackbar('Error', 'Failed to load members');
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }
}

import 'package:get/get.dart';
import '../../../core/utils/api_client.dart';
import 'package:dio/dio.dart' as dio_lib;

class AdminHomeController extends GetxController {
  final ApiClient apiClient = Get.find<ApiClient>();
  final isLoading = true.obs;
  final summaryData = {}.obs;

  @override
  void onInit() {
    super.onInit();
    fetchSummary();
  }

  Future<void> fetchSummary() async {
    isLoading.value = true;
    try {
      final response = await apiClient.dio.get('/reports/summary');
      if (response.statusCode == 200) {
        summaryData.value = response.data;
      }
    } on dio_lib.DioException catch (e) {
      Get.snackbar('Error', 'Failed to load summary data');
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

import 'package:get/get.dart';
import '../../../core/utils/api_client.dart';
import 'package:dio/dio.dart' as dio_lib;

class MemberPaymentsController extends GetxController {
  final ApiClient apiClient = Get.find<ApiClient>();
  final isLoading = true.obs;
  final payments = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchPayments();
  }

  Future<void> fetchPayments() async {
    isLoading.value = true;
    try {
      // Re-using the profile endpoint which includes the last 50 payments
      final response = await apiClient.dio.get('/members/profile');
      if (response.statusCode == 200) {
        payments.value = response.data['payments'] ?? [];
      }
    } on dio_lib.DioException catch (e) {
      Get.snackbar('Error', 'Failed to load payments history');
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }
}

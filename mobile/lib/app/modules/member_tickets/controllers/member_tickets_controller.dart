import 'package:get/get.dart';
import '../../../core/utils/api_client.dart';
import 'package:dio/dio.dart' as dio_lib;

class MemberTicketsController extends GetxController {
  final ApiClient apiClient = Get.find<ApiClient>();
  final isLoading = true.obs;
  final tickets = [].obs;

  @override
  void onInit() {
    super.onInit();
    fetchTickets();
  }

  Future<void> fetchTickets() async {
    isLoading.value = true;
    try {
      final response = await apiClient.dio.get('/tickets');
      if (response.statusCode == 200) {
        tickets.value = response.data;
      }
    } on dio_lib.DioException catch (e) {
      Get.snackbar('Error', 'Failed to load tickets');
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }
}

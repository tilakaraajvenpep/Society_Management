import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/utils/api_client.dart';
import 'package:dio/dio.dart' as dio_lib;

class AdminCollectPaymentController extends GetxController {
  final ApiClient apiClient = Get.find<ApiClient>();
  
  final isLoading = false.obs;
  final isFetchingMembers = true.obs;
  final members = [].obs;
  
  final selectedMemberId = ''.obs;
  final amountController = TextEditingController();
  final notesController = TextEditingController();
  final selectedMode = 'CASH'.obs;
  final selectedPeriod = 'Monthly'.obs;

  final paymentModes = ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'];
  final periods = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];

  @override
  void onInit() {
    super.onInit();
    fetchMembers();
  }

  Future<void> fetchMembers() async {
    isFetchingMembers.value = true;
    try {
      final response = await apiClient.dio.get('/members');
      if (response.statusCode == 200) {
        members.value = response.data;
        if (members.isNotEmpty) {
          selectedMemberId.value = members[0]['id'];
        }
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to load members');
    } finally {
      isFetchingMembers.value = false;
    }
  }

  Future<void> submitPayment() async {
    if (selectedMemberId.value.isEmpty) {
      Get.snackbar('Error', 'Please select a member');
      return;
    }
    if (amountController.text.isEmpty) {
      Get.snackbar('Error', 'Please enter an amount');
      return;
    }

    isLoading.value = true;
    try {
      final response = await apiClient.dio.post(
        '/payments',
        data: {
          'memberId': selectedMemberId.value,
          'amount': double.parse(amountController.text),
          'mode': selectedMode.value,
          'notes': notesController.text,
          'periodLabel': selectedPeriod.value,
          'paidMonths': _getMonthsFromPeriod(selectedPeriod.value),
        },
      );

      if (response.statusCode == 200) {
        Get.back();
        Get.snackbar('Success', 'Payment recorded successfully', backgroundColor: Colors.green, colorText: Colors.white);
      }
    } on dio_lib.DioException catch (e) {
      Get.snackbar('Error', e.response?.data['message'] ?? 'Failed to record payment');
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }

  int _getMonthsFromPeriod(String period) {
    switch (period) {
      case 'Quarterly': return 3;
      case 'Half-Yearly': return 6;
      case 'Annual': return 12;
      default: return 1;
    }
  }

  @override
  void onClose() {
    amountController.dispose();
    notesController.dispose();
    super.onClose();
  }
}

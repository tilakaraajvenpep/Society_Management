import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/admin_collect_payment_controller.dart';

class AdminCollectPaymentView extends GetView<AdminCollectPaymentController> {
  const AdminCollectPaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Collect Payment'),
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isFetchingMembers.value) {
          return const Center(child: CircularProgressIndicator());
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Record a new payment from a society member.',
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 32),
              
              // Member Selection
              const Text('Select Member', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: controller.selectedMemberId.value,
                    items: controller.members.map((m) {
                      return DropdownMenuItem<String>(
                        value: m['id'],
                        child: Text('${m['name']} (Flat ${m['flatNo']})'),
                      );
                    }).toList(),
                    onChanged: (val) => controller.selectedMemberId.value = val!,
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Amount
              TextField(
                controller: controller.amountController,
                decoration: const InputDecoration(
                  labelText: 'Amount (₹)',
                  prefixIcon: Icon(Icons.currency_rupee),
                ),
                keyboardType: TextInputType.number,
              ),
              
              const SizedBox(height: 24),
              
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Mode', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              value: controller.selectedMode.value,
                              items: controller.paymentModes.map((mode) {
                                return DropdownMenuItem(value: mode, child: Text(mode));
                              }).toList(),
                              onChanged: (val) => controller.selectedMode.value = val!,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Period', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              value: controller.selectedPeriod.value,
                              items: controller.periods.map((period) {
                                return DropdownMenuItem(value: period, child: Text(period));
                              }).toList(),
                              onChanged: (val) => controller.selectedPeriod.value = val!,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              TextField(
                controller: controller.notesController,
                decoration: const InputDecoration(
                  labelText: 'Notes (Optional)',
                  prefixIcon: Icon(Icons.notes),
                ),
                maxLines: 2,
              ),
              
              const SizedBox(height: 40),
              
              ElevatedButton(
                onPressed: controller.isLoading.value ? null : controller.submitPayment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563eb),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: controller.isLoading.value
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Record Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      }),
    );
  }
}

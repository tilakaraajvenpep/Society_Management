import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/member_payments_controller.dart';

class MemberPaymentsView extends GetView<MemberPaymentsController> {
  const MemberPaymentsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment History'),
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.payments.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.history, size: 64, color: Colors.grey[300]),
                const SizedBox(height: 16),
                const Text('No payment records found', style: TextStyle(color: Colors.grey)),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: controller.fetchPayments,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.payments.length,
            itemBuilder: (context, index) {
              final payment = controller.payments[index];
              return _buildPaymentCard(payment);
            },
          ),
        );
      }),
    );
  }

  Widget _buildPaymentCard(Map payment) {
    final status = payment['status']?.toString().toUpperCase() ?? 'PAID';
    final amount = payment['amount']?.toDouble() ?? 0.0;
    final date = payment['paymentDate']?.toString().split('T')[0] ?? '';
    
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[100]!),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF10b981).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.receipt, color: Color(0xFF10b981)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    payment['periodLabel'] ?? 'Maintenance',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Receipt: ${payment['receiptNumber'] ?? 'N/A'} • $date',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₹${amount.toInt()}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF2563eb)),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getStatusColor(status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(color: _getStatusColor(status), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PAID': return const Color(0xFF10b981);
      case 'PENDING': return Colors.orange;
      case 'CANCELLED': return Colors.red;
      default: return Colors.grey;
    }
  }
}

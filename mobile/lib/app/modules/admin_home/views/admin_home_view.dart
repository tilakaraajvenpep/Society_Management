import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/admin_home_controller.dart';

class AdminHomeView extends GetView<AdminHomeController> {
  const AdminHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: controller.logout,
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final summary = controller.summaryData;
        if (summary.isEmpty) {
          return const Center(child: Text('No summary data found'));
        }

        return RefreshIndicator(
          onRefresh: controller.fetchSummary,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Overview',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _buildKPIGrid(summary),
                const SizedBox(height: 24),
                const Text(
                  'Quick Actions',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _buildQuickActions(),
                const SizedBox(height: 24),
                const Text(
                  'Payment Handover Status',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _buildHandoverStatus(summary),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildKPIGrid(Map summary) {
    final outstanding = summary['totals']?['outstanding']?.toDouble() ?? 0.0;
    final cashInHand = summary['totals']?['cashInHand']?.toDouble() ?? 0.0;
    final monthIncome = summary['monthly']?['income']?['current']?.toDouble() ?? 0.0;

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _buildKPICard('Outstanding', '₹${outstanding.toInt()}', Colors.orange),
        _buildKPICard('Cash in Hand', '₹${cashInHand.toInt()}', Colors.green),
        _buildKPICard('Monthly Income', '₹${monthIncome.toInt()}', Colors.blue),
        _buildKPICard('Active Members', summary['totals']?['memberCount']?.toString() ?? '0', Colors.purple),
      ],
    );
  }

  Widget _buildKPICard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[100]!),
        boxShadow: [
          BoxShadow(color: Colors.grey.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        _buildActionItem(Icons.add_card, 'Collect', () => Get.toNamed('/admin-collect-payment')),
        const SizedBox(width: 16),
        _buildActionItem(Icons.people, 'Members', () => Get.toNamed('/admin-members')),
        const SizedBox(width: 16),
        _buildActionItem(Icons.account_balance_wallet, 'Expenses', () {}),
      ],
    );
  }

  Widget _buildActionItem(IconData icon, String label, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: const Color(0xFF2563eb).withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(icon, color: const Color(0xFF2563eb)),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF2563eb)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHandoverStatus(Map summary) {
    final handovers = summary['handoverStatus'] as List?;
    if (handovers == null || handovers.isEmpty) {
      return const Center(child: Text('No pending handovers'));
    }

    return Column(
      children: handovers.map((h) {
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey[100]!),
          ),
          child: ListTile(
            title: Text(h['handoverStatus'].toString().replaceAll('_', ' ')),
            trailing: Text(
              '₹${h['_sum']?['amount']?.toInt() ?? 0}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        );
      }).toList(),
    );
  }
}

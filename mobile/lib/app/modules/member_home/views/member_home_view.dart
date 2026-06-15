import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/member_home_controller.dart';

class MemberHomeView extends GetView<MemberHomeController> {
  const MemberHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Member Dashboard'),
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

        final member = controller.memberData;
        if (member.isEmpty) {
          return const Center(child: Text('No data found'));
        }

        return RefreshIndicator(
          onRefresh: controller.fetchProfile,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(member),
                const SizedBox(height: 24),
                _buildDuesCard(member),
                const SizedBox(height: 24),
                const Text(
                  'Quick Actions',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _buildQuickActions(),
                const SizedBox(height: 24),
                const Text(
                  'Recent Activity',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _buildRecentPayments(member['payments']),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildHeader(Map member) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome back,',
          style: TextStyle(color: Colors.grey[600], fontSize: 16),
        ),
        Text(
          member['name'] ?? 'Member',
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF2563eb).withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            'Flat ${member['flatNo']}',
            style: const TextStyle(
              color: Color(0xFF2563eb),
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDuesCard(Map member) {
    final dues = member['outstandingDues']?.toDouble() ?? 0.0;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2563eb), Color(0xFF1d4ed8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2563eb).withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'TOTAL OUTSTANDING',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '₹${dues.toStringAsFixed(2)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF2563eb),
              minimumSize: const Size(double.infinity, 44),
            ),
            child: const Text('Pay Now'),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        _buildActionItem(Icons.receipt_long, 'Receipts', () => Get.toNamed('/member-payments')),
        const SizedBox(width: 16),
        _buildActionItem(Icons.support_agent, 'Helpdesk', () => Get.toNamed('/member-tickets')),
        const SizedBox(width: 16),
        _buildActionItem(Icons.info_outline, 'Notices', () {}),
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
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Column(
            children: [
              Icon(icon, color: const Color(0xFF2563eb)),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentPayments(List? payments) {
    if (payments == null || payments.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Center(child: Text('No recent payments found')),
      );
    }

    return Column(
      children: payments.take(5).map((p) {
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey[100]!),
          ),
          child: ListTile(
            leading: const CircleAvatar(
              backgroundColor: Color(0xFF10b981),
              child: Icon(Icons.check, color: Colors.white, size: 20),
            ),
            title: Text(
              '₹${p['amount']}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(p['periodLabel'] ?? 'Maintenance Payment'),
            trailing: Text(
              p['paymentDate'].toString().split('T')[0],
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
          ),
        );
      }).toList(),
    );
  }
}

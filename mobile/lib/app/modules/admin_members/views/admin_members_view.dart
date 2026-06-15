import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/admin_members_controller.dart';
import 'package:url_launcher/url_launcher.dart';

class AdminMembersView extends GetView<AdminMembersController> {
  const AdminMembersView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Member Directory'),
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.members.isEmpty) {
          return const Center(child: Text('No members found'));
        }

        return RefreshIndicator(
          onRefresh: controller.fetchMembers,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.members.length,
            itemBuilder: (context, index) {
              final member = controller.members[index];
              return _buildMemberCard(member);
            },
          ),
        );
      }),
    );
  }

  Widget _buildMemberCard(Map member) {
    final name = member['name'] ?? 'N/A';
    final flat = member['flatNo'] ?? 'N/A';
    final mobile = member['mobile'] ?? '';
    final dues = member['outstandingDues']?.toDouble() ?? 0.0;

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[100]!),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: const Color(0xFF2563eb).withOpacity(0.1),
          child: Text(
            name.substring(0, 1).toUpperCase(),
            style: const TextStyle(color: Color(0xFF2563eb), fontWeight: FontWeight.bold),
          ),
        ),
        title: Row(
          children: [
            Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Flat $flat',
                style: TextStyle(color: Colors.grey[700], fontSize: 10),
              ),
            ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(mobile, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
            const SizedBox(height: 4),
            Text(
              'Dues: ₹${dues.toInt()}',
              style: TextStyle(
                color: dues > 0 ? Colors.red : Colors.green,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.call, color: Color(0xFF10b981)),
              onPressed: () => _makeCall(mobile),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Future<void> _makeCall(String mobile) async {
    final Uri url = Uri.parse('tel:$mobile');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }
}

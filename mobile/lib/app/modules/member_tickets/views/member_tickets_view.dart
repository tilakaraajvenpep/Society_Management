import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/member_tickets_controller.dart';

class MemberTicketsView extends GetView<MemberTicketsController> {
  const MemberTicketsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Support Tickets'),
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: const Color(0xFF2563eb),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.tickets.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.support_agent, size: 64, color: Colors.grey[300]),
                const SizedBox(height: 16),
                const Text('No tickets raised yet', style: TextStyle(color: Colors.grey)),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: controller.fetchTickets,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: controller.tickets.length,
            itemBuilder: (context, index) {
              final ticket = controller.tickets[index];
              return _buildTicketCard(ticket);
            },
          ),
        );
      }),
    );
  }

  Widget _buildTicketCard(Map ticket) {
    final status = ticket['status']?.toString().replaceAll('_', ' ') ?? 'OPEN';
    final priority = ticket['priority']?.toString() ?? 'MEDIUM';
    final date = ticket['createdAt']?.toString().split('T')[0] ?? '';

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[100]!),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Text(
          ticket['subject'] ?? 'No Subject',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Text(
              ticket['description'] ?? '',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.grey[600], fontSize: 13),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildTag(status, _getStatusColor(status)),
                const SizedBox(width: 8),
                _buildTag(priority, _getPriorityColor(priority)),
                const Spacer(),
                Text(date, style: TextStyle(color: Colors.grey[400], fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTag(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'OPEN': return Colors.blue;
      case 'IN PROGRESS': return Colors.orange;
      case 'RESOLVED': return Colors.green;
      case 'CLOSED': return Colors.grey;
      default: return Colors.grey;
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority.toUpperCase()) {
      case 'HIGH':
      case 'URGENT': return Colors.red;
      case 'MEDIUM': return Colors.orange;
      case 'LOW': return Colors.green;
      default: return Colors.grey;
    }
  }
}

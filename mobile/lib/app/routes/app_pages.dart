import 'package:get/get.dart';
import '../modules/tenant_slug/bindings/tenant_slug_binding.dart';
import '../modules/tenant_slug/views/tenant_slug_view.dart';
import '../modules/login/bindings/login_binding.dart';
import '../modules/login/views/login_view.dart';
import '../modules/member_home/bindings/member_home_binding.dart';
import '../modules/member_home/views/member_home_view.dart';
import '../modules/member_payments/bindings/member_payments_binding.dart';
import '../modules/member_payments/views/member_payments_view.dart';
import '../modules/member_tickets/bindings/member_tickets_binding.dart';
import '../modules/member_tickets/views/member_tickets_view.dart';
import '../modules/admin_home/bindings/admin_home_binding.dart';
import '../modules/admin_home/views/admin_home_view.dart';
import '../modules/admin_members/bindings/admin_members_binding.dart';
import '../modules/admin_members/views/admin_members_view.dart';
import '../modules/admin_collect_payment/bindings/admin_collect_payment_binding.dart';
import '../modules/admin_collect_payment/views/admin_collect_payment_view.dart';

part 'app_routes.dart';

class AppPages {
  static const INITIAL = Routes.TENANT_SLUG;

  static final routes = [
    GetPage(
      name: Routes.TENANT_SLUG,
      page: () => const TenantSlugView(),
      binding: TenantSlugBinding(),
    ),
    GetPage(
      name: Routes.LOGIN,
      page: () => const LoginView(),
      binding: LoginBinding(),
    ),
    GetPage(
      name: Routes.MEMBER_HOME,
      page: () => const MemberHomeView(),
      binding: MemberHomeBinding(),
    ),
    GetPage(
      name: Routes.MEMBER_PAYMENTS,
      page: () => const MemberPaymentsView(),
      binding: MemberPaymentsBinding(),
    ),
    GetPage(
      name: Routes.MEMBER_TICKETS,
      page: () => const MemberTicketsView(),
      binding: MemberTicketsBinding(),
    ),
    GetPage(
      name: Routes.ADMIN_HOME,
      page: () => const AdminHomeView(),
      binding: AdminHomeBinding(),
    ),
    GetPage(
      name: Routes.ADMIN_MEMBERS,
      page: () => const AdminMembersView(),
      binding: AdminMembersBinding(),
    ),
    GetPage(
      name: Routes.ADMIN_COLLECT_PAYMENT,
      page: () => const AdminCollectPaymentView(),
      binding: AdminCollectPaymentBinding(),
    ),
  ];
}

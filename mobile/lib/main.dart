import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:firebase_core/firebase_core.dart';
import 'app/core/theme/app_theme.dart';
import 'app/routes/app_pages.dart';
import 'app/core/utils/api_client.dart';
import 'app/core/utils/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Note: This requires google-services.json / GoogleService-Info.plist
    // await Firebase.initializeApp();
    // await Get.putAsync(() => NotificationService().init());
  } catch (e) {
    print("Firebase initialization skipped: $e");
  }

  // Initialize services
  await Get.putAsync(() => ApiClient().init());

  runApp(
    GetMaterialApp(
      title: "SocietyPro",
      initialRoute: AppPages.INITIAL,
      getPages: AppPages.routes,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
    ),
  );
}

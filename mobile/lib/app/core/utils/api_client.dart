import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart' hide Response;
import 'constants.dart';

class ApiClient extends GetxService {
  late Dio dio;
  final storage = const FlutterSecureStorage();

  Future<ApiClient> init() async {
    dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        if (e.response?.statusCode == 401) {
          storage.delete(key: 'jwt_token');
          storage.delete(key: 'tenant_slug');
          Get.offAllNamed('/tenant-slug');
        }
        return handler.next(e);
      },
    ));
    return this;
  }
}

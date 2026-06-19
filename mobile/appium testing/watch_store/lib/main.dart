import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_screen.dart';
import 'admin_screen.dart';
import 'user_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SharedPreferences prefs = await SharedPreferences.getInstance();
  bool isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
  String role = prefs.getString('role') ?? 'user';

  runApp(MyApp(isLoggedIn: isLoggedIn, role: role));
}

class MyApp extends StatelessWidget {
  final bool isLoggedIn;
  final String role;

  const MyApp({super.key, required this.isLoggedIn, required this.role});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Luxe Watch Store',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.amber,
        scaffoldBackgroundColor: const Color(
          0xFF0F172A,
        ), // Deep elegant navy/black
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.amber,
          brightness: Brightness.dark,
        ),
        fontFamily:
            'Roboto', // You can change this to a premium font like Montserrat
      ),
      home: isLoggedIn
          ? (role == 'admin' ? const AdminScreen() : const UserScreen())
          : const AuthScreen(),
    );
  }
}

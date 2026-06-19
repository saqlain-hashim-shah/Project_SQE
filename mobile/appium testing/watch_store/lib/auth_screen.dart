import 'package:flutter/material.dart';
import 'db_helper.dart';
import 'admin_screen.dart';
import 'user_screen.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool isLogin = true;
  final dbHelper = DbHelper();

  handleAuth() async {
    var dbClient = await dbHelper.db;
    String email = _emailController.text.trim();
    String password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Fields cannot be empty"),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (isLogin) {
      List<Map> res = await dbClient.rawQuery(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [email, password],
      );

      if (res.isNotEmpty) {
        String role = res.first['role'];
        await DbHelper.saveSession(email, role);
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) =>
                role == 'admin' ? const AdminScreen() : const UserScreen(),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Invalid Credentials"),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } else {
      // Signup Logic - Using parameterized queries
      await dbClient.rawInsert(
        "INSERT INTO users (email, password, role) VALUES (?, ?, 'user')",
        [email, password],
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Signup Successful! Please Login."),
          backgroundColor: Colors.green,
        ),
      );
      // FIX: clear fields after signup so old text doesn't linger into login mode
      _emailController.clear();
      _passwordController.clear();
      setState(() {
        isLogin = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF1E293B), Color(0xFF020617)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.watch, size: 80, color: Colors.amber),
                  const SizedBox(height: 16),
                  const Text(
                    "Luxe Watches",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isLogin ? "Welcome back" : "Create an account",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 40),

                  Semantics(
                    identifier: "email_field",
                    label: "email_field",
                    container: true,
                    explicitChildNodes: true,
                    child: TextField(
                      key: const Key('email_field'),
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textCapitalization: TextCapitalization.none,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.1),
                        prefixIcon: const Icon(
                          Icons.email_outlined,
                          color: Colors.amber,
                        ),
                        labelText: "Email",
                        labelStyle: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                        ),
                        hintText: "e.g., admin@test.com",
                        hintStyle: TextStyle(
                          color: Colors.white.withOpacity(0.3),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  Semantics(
                    identifier: "password_field",
                    label: "password_field",
                    container: true,
                    explicitChildNodes: true,
                    child: TextField(
                      key: const Key('password_field'),
                      controller: _passwordController,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.1),
                        prefixIcon: const Icon(
                          Icons.lock_outline,
                          color: Colors.amber,
                        ),
                        labelText: "Password",
                        labelStyle: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),

                  Semantics(
                    identifier: "auth_action_button",
                    label: "auth_action_button",
                    button: true,
                    container: true,
                    explicitChildNodes: true,
                    child: SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: ElevatedButton(
                        key: const Key('auth_action_button'),
                        onPressed: handleAuth,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber,
                          foregroundColor: Colors.black87,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                          elevation: 5,
                        ),
                        child: Text(
                          isLogin ? "LOGIN" : "REGISTER",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  Semantics(
                    identifier: "toggle_auth_mode_button",
                    label: "toggle_auth_mode_button",
                    button: true,
                    container: true,
                    explicitChildNodes: true,
                    child: TextButton(
                      key: const Key('toggle_auth_mode_button'),
                      onPressed: () => setState(() => isLogin = !isLogin),
                      child: RichText(
                        text: TextSpan(
                          text: isLogin
                              ? "Don't have an account? "
                              : "Already have an account? ",
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                          ),
                          children: [
                            TextSpan(
                              text: isLogin ? "Sign Up" : "Login",
                              style: const TextStyle(
                                color: Colors.amber,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

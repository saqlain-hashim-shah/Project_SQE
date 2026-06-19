import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DbHelper {
  static Database? _db;

  Future<Database> get db async => _db ??= await initDb();

  initDb() async {
    String path = join(await getDatabasesPath(), 'watch_store.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute(
          'CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT, role TEXT)',
        );
        await db.execute(
          'CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, image TEXT)',
        );
        await db.execute(
          'CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, userEmail TEXT, productName TEXT, price REAL, date TEXT)',
        );
        // Default Admin
        await db.rawInsert(
          "INSERT INTO users (email, password, role) VALUES ('admin@test.com', 'admin123', 'admin')",
        );
      },
    );
  }

  // Secure Query Method
  Future<List<Map<String, dynamic>>> secureLogin(
    String email,
    String password,
  ) async {
    var dbClient = await db;
    return await dbClient.query(
      'users',
      where: 'email = ? AND password = ?',
      whereArgs: [email, password],
    );
  }

  static Future<void> saveSession(String email, String role) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('email', email);
    await prefs.setString('role', role);
    await prefs.setBool('isLoggedIn', true);
  }

  static Future<void> clearSession() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}

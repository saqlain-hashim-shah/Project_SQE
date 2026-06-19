import 'dart:io';
import 'package:flutter/material.dart';
import 'db_helper.dart';
import 'auth_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserScreen extends StatefulWidget {
  const UserScreen({super.key});
  @override
  State<UserScreen> createState() => _UserScreenState();
}

class _UserScreenState extends State<UserScreen> {
  final dbHelper = DbHelper();
  List<Map<String, dynamic>> products = [];
  List<Map<String, dynamic>> cart = [];

  @override
  void initState() {
    super.initState();
    fetchProducts();
  }

  fetchProducts() async {
    var dbClient = await dbHelper.db;
    var res = await dbClient.query('products');
    setState(() {
      products = res;
    });
  }

  addToCart(Map<String, dynamic> product) {
    setState(() {
      cart.add(product);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("${product['name']} added to cart!"),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  checkout() async {
    if (cart.isEmpty) return;
    var dbClient = await dbHelper.db;
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String userEmail = prefs.getString('email') ?? 'unknown@test.com';

    for (var item in cart) {
      await dbClient.insert('orders', {
        'userEmail': userEmail,
        'productName': item['name'],
        'price': item['price'],
        'date': DateTime.now().toString(),
      });
    }
    setState(() {
      cart.clear();
    });
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Order Placed Successfully!"),
        backgroundColor: Colors.amber,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        // FIX: wrapped with Semantics to confirm we reached User Dashboard
        title: Semantics(
          identifier: "user_dashboard_title",
          label: "user_dashboard_title",
          container: true,
          explicitChildNodes: true,
          child: const Text(
            "Luxe Collection",
            style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold),
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.amber),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              // FIX: wrapped cart button with Semantics
              Semantics(
                identifier: "cart_button",
                label: "cart_button",
                button: true,
                container: true,
                explicitChildNodes: true,
                child: IconButton(
                  icon: const Icon(Icons.shopping_cart),
                  onPressed: () => showModalBottomSheet(
                    context: context,
                    backgroundColor: const Color(0xFF1E293B),
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(20),
                      ),
                    ),
                    builder: (_) => StatefulBuilder(
                      builder: (context, setModalState) => Column(
                        children: [
                          const Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text(
                              "Your Cart",
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          Expanded(
                            child: cart.isEmpty
                                ? const Center(
                                    child: Text(
                                      "Cart is empty",
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: cart.length,
                                    itemBuilder: (_, i) => ListTile(
                                      leading: const Icon(
                                        Icons.watch,
                                        color: Colors.amber,
                                      ),
                                      title: Text(
                                        cart[i]['name'],
                                        style: const TextStyle(
                                          color: Colors.white,
                                        ),
                                      ),
                                      trailing: Text(
                                        "\$${cart[i]['price']}",
                                        style: const TextStyle(
                                          color: Colors.amber,
                                        ),
                                      ),
                                    ),
                                  ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: SizedBox(
                              width: double.infinity,
                              height: 50,
                              // FIX: wrapped checkout button with Semantics
                              child: Semantics(
                                identifier: "checkout_button",
                                label: "checkout_button",
                                button: true,
                                container: true,
                                explicitChildNodes: true,
                                child: ElevatedButton(
                                  onPressed: cart.isEmpty
                                      ? null
                                      : () {
                                          checkout();
                                          Navigator.pop(context);
                                        },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.amber,
                                    foregroundColor: Colors.black,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(15),
                                    ),
                                  ),
                                  child: const Text(
                                    "Checkout Now",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
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
              if (cart.isNotEmpty)
                Positioned(
                  right: 6,
                  top: 6,
                  child: CircleAvatar(
                    radius: 8,
                    backgroundColor: Colors.redAccent,
                    child: Text(
                      "${cart.length}",
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          // FIX: wrapped logout button with Semantics
          Semantics(
            identifier: "user_logout_button",
            label: "user_logout_button",
            button: true,
            container: true,
            explicitChildNodes: true,
            child: IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () async {
                await DbHelper.clearSession();
                if (!mounted) return;
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const AuthScreen()),
                );
              },
            ),
          ),
        ],
      ),
      body: products.isEmpty
          ? const Center(
              child: Text(
                "No watches available right now.",
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(12.0),
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.7,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: products.length,
                itemBuilder: (_, i) {
                  bool hasImage =
                      products[i]['image'] != 'watch_icon' &&
                      File(products[i]['image']).existsSync();

                  return Card(
                    color: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    elevation: 5,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(15),
                            ),
                            child: hasImage
                                ? Image.file(
                                    File(products[i]['image']),
                                    fit: BoxFit.cover,
                                  )
                                : Container(
                                    color: Colors.white.withOpacity(0.05),
                                    child: const Icon(
                                      Icons.watch,
                                      size: 60,
                                      color: Colors.amber,
                                    ),
                                  ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                products[i]['name'],
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "\$${products[i]['price']}",
                                style: const TextStyle(
                                  color: Colors.amber,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              // FIX: wrapped Add to Cart button, unique id per product
                              SizedBox(
                                width: double.infinity,
                                child: Semantics(
                                  identifier:
                                      "add_to_cart_button_${products[i]['id']}",
                                  label:
                                      "add_to_cart_button_${products[i]['id']}",
                                  button: true,
                                  container: true,
                                  explicitChildNodes: true,
                                  child: ElevatedButton(
                                    onPressed: () => addToCart(products[i]),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.white.withOpacity(
                                        0.1,
                                      ),
                                      foregroundColor: Colors.amber,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    child: const Text("Add to Cart"),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}

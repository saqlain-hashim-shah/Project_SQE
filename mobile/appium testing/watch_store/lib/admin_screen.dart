import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'db_helper.dart';
import 'auth_screen.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final dbHelper = DbHelper();
  List<Map<String, dynamic>> products = [];
  List<Map<String, dynamic>> orders = [];

  final _nameController = TextEditingController();
  final _priceController = TextEditingController();
  File? _selectedImage;

  @override
  void initState() {
    super.initState();
    refreshData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  refreshData() async {
    var dbClient = await dbHelper.db;
    var p = await dbClient.query('products');
    var o = await dbClient.query('orders');
    setState(() {
      products = p;
      orders = o;
    });
  }

  Future<void> _pickImage() async {
    final pickedFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
    );
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }

  addProduct() async {
    if (_nameController.text.isEmpty || _priceController.text.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Please fill all fields!")));
      return;
    }

    var dbClient = await dbHelper.db;
    await dbClient.insert('products', {
      'name': _nameController.text,
      'price': double.tryParse(_priceController.text) ?? 0.0,
      'image': _selectedImage?.path ?? 'watch_icon',
    });

    _nameController.clear();
    _priceController.clear();
    setState(() {
      _selectedImage = null;
    });
    refreshData();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Product added successfully!")),
    );
  }

  deleteProduct(int id) async {
    var dbClient = await dbHelper.db;
    await dbClient.delete('products', where: 'id = ?', whereArgs: [id]);
    refreshData();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        appBar: AppBar(
          backgroundColor: const Color(0xFF1E293B),
          // FIX: explicitChildNodes added so label stays exactly "dashboard_title"
          title: Semantics(
            identifier: "dashboard_title",
            label: "dashboard_title",
            container: true,
            explicitChildNodes: true,
            child: const Text(
              "Admin Dashboard",
              key: Key("dashboard_title"),
              style: TextStyle(color: Colors.amber),
            ),
          ),
          iconTheme: const IconThemeData(color: Colors.amber),
          actions: [
            Semantics(
              identifier: "admin_logout_button",
              label: "admin_logout_button",
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
          bottom: const TabBar(
            indicatorColor: Colors.amber,
            labelColor: Colors.amber,
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(icon: Icon(Icons.inventory), text: "Products"),
              Tab(icon: Icon(Icons.history), text: "Orders"),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Tab 1: Manage Products
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      height: 120,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        border: Border.all(
                          color: Colors.amber.withOpacity(0.5),
                        ),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: _selectedImage != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(15),
                              child: Image.file(
                                _selectedImage!,
                                fit: BoxFit.cover,
                              ),
                            )
                          : const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.add_a_photo,
                                  color: Colors.amber,
                                  size: 40,
                                ),
                                SizedBox(height: 8),
                                Text(
                                  "Tap to select Watch Image",
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // FIX: container:true + explicitChildNodes:true for discovery
                  Semantics(
                    identifier: "product_name_input",
                    label: "product_name_input",
                    container: true,
                    explicitChildNodes: true,
                    child: TextField(
                      controller: _nameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: "Watch Name",
                        labelStyle: const TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.05),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Semantics(
                    identifier: "product_price_input",
                    label: "product_price_input",
                    container: true,
                    explicitChildNodes: true,
                    child: TextField(
                      controller: _priceController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: "Price (\$)",
                        labelStyle: const TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.05),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Semantics(
                    identifier: "add_product_button",
                    label: "add_product_button",
                    button: true,
                    container: true,
                    explicitChildNodes: true,
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: addProduct,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          "ADD PRODUCT",
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: ListView.builder(
                      itemCount: products.length,
                      itemBuilder: (_, i) {
                        final imagePath = products[i]['image'] ?? 'watch_icon';
                        final hasValidImage =
                            imagePath != 'watch_icon' &&
                            File(imagePath).existsSync();

                        return Card(
                          color: const Color(0xFF1E293B),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Colors.transparent,
                              backgroundImage: hasValidImage
                                  ? FileImage(File(imagePath))
                                  : null,
                              child: !hasValidImage
                                  ? const Icon(Icons.watch, color: Colors.amber)
                                  : null,
                            ),
                            title: Text(
                              products[i]['name'] ?? 'Unknown Product',
                              style: const TextStyle(color: Colors.white),
                            ),
                            subtitle: Text(
                              "\$${products[i]['price'] ?? 0.0}",
                              style: const TextStyle(color: Colors.amber),
                            ),
                            trailing: Semantics(
                              identifier:
                                  "product_delete_button_${products[i]['id']}",
                              label:
                                  "product_delete_button_${products[i]['id']}",
                              button: true,
                              container: true,
                              explicitChildNodes: true,
                              child: IconButton(
                                icon: const Icon(
                                  Icons.delete,
                                  color: Colors.redAccent,
                                ),
                                onPressed: () =>
                                    deleteProduct(products[i]['id']),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            // Tab 2: Order History
            ListView.builder(
              padding: const EdgeInsets.all(8.0),
              itemCount: orders.length,
              itemBuilder: (_, i) => Card(
                color: const Color(0xFF1E293B),
                child: ListTile(
                  leading: const Icon(Icons.shopping_bag, color: Colors.amber),
                  title: Text(
                    "Order #${orders[i]['id']}",
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  subtitle: Text(
                    "User: ${orders[i]['userEmail']}\nItem: ${orders[i]['productName']}",
                    style: const TextStyle(color: Colors.grey),
                  ),
                  trailing: Text(
                    "\$${orders[i]['price']}",
                    style: const TextStyle(
                      color: Colors.amber,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

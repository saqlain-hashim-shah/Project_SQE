from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys

def setup_driver():
    """Initialize Appium driver with proper options"""
    options = UiAutomator2Options()
    options.platform_name = 'Android'
    options.device_name = 'emulator-5554'
    options.app = r'C:\watch_store\build\app\outputs\flutter-apk\app-debug.apk'
    options.automation_name = 'UiAutomator2'

    options.app_wait_activity = '.MainActivity'
    options.app_wait_package = 'com.example.watch_store'
    options.no_reset = True
    options.full_reset = False

    print("🔌 Initializing Appium driver...")
    try:
        driver = webdriver.Remote("http://127.0.0.1:4723", options=options)
        print("✅ Driver initialized successfully!")
        return driver
    except Exception as e:
        print(f"❌ Failed to initialize driver: {e}")
        sys.exit(1)

def type_into(driver, accessibility_id, text, wait, timeout_msg):
    """Helper: find field by accessibility id, clear it, tap it, then type using mobile:type"""
    field = wait.until(
        EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, accessibility_id)),
        message=timeout_msg
    )
    field.click()
    time.sleep(0.3)
    try:
        field.clear()
    except Exception:
        pass
    time.sleep(0.3)
    driver.execute_script('mobile: type', {'text': text})
    time.sleep(0.5)
    return field

def test_login(driver, email="admin@test.com", password="admin123"):
    """Generic login: fills email/password and clicks the auth button"""
    try:
        wait = WebDriverWait(driver, 15)

        print(f"\n📱 Logging in as {email}...")
        type_into(driver, "email_field", email, wait, "Email field not found")
        type_into(driver, "password_field", password, wait, "Password field not found")

        login_btn = wait.until(
            EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "auth_action_button")),
            message="Login button not found or not clickable"
        )
        login_btn.click()
        time.sleep(2)
        print("✅ Login submitted!")
        return True

    except Exception as e:
        print(f"❌ Login failed: {e}")
        driver.save_screenshot("login_failed.png")
        return False

def test_admin_dashboard_reached(driver):
    """Confirm we landed on Admin Dashboard after login"""
    try:
        wait = WebDriverWait(driver, 15)
        wait.until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "dashboard_title")),
            message="Admin Dashboard title not found"
        )
        print("✅ Reached Admin Dashboard!")
        return True
    except Exception as e:
        print(f"❌ Admin Dashboard not reached: {e}")
        driver.save_screenshot("admin_dashboard_not_found.png")
        return False

def test_add_product(driver):
    """Test adding a product from Admin Dashboard"""
    try:
        print("\n📦 Testing Add Product...")
        wait = WebDriverWait(driver, 15)

        type_into(driver, "product_name_input", "Rolex Submariner", wait, "Product name field not found")
        type_into(driver, "product_price_input", "9999", wait, "Product price field not found")

        add_btn = wait.until(
            EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "add_product_button")),
            message="Add Product button not found"
        )
        add_btn.click()
        time.sleep(2)

        print("✅ Add Product test completed!")
        driver.save_screenshot("add_product_result.png")
        return True

    except Exception as e:
        print(f"❌ Add Product test failed: {e}")
        driver.save_screenshot("add_product_failed.png")
        return False

def test_logout(driver):
    """Logout by trying admin logout button first, then user logout button"""
    try:
        print("\n🔓 Logging out...")
        wait = WebDriverWait(driver, 10)
        try:
            logout_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "admin_logout_button")
        except Exception:
            logout_btn = wait.until(
                EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "user_logout_button"))
            )
        logout_btn.click()
        time.sleep(1.5)
        print("✅ Logged out successfully!")
        return True
    except Exception as e:
        print(f"❌ Logout failed: {e}")
        driver.save_screenshot("logout_failed.png")
        return False

def test_signup_user(driver, email, password):
    """Sign up a new regular user from the Auth screen"""
    try:
        print(f"\n📝 Signing up new user: {email}")
        wait = WebDriverWait(driver, 15)

        toggle_btn = wait.until(
            EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "toggle_auth_mode_button")),
            message="Toggle button not found"
        )
        toggle_btn.click()
        time.sleep(1)

        type_into(driver, "email_field", email, wait, "Email field not found in signup mode")
        type_into(driver, "password_field", password, wait, "Password field not found in signup mode")

        register_btn = wait.until(
            EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "auth_action_button")),
            message="Register button not found"
        )
        register_btn.click()
        time.sleep(2)

        print("✅ Signup submitted!")
        driver.save_screenshot("signup_result.png")
        return True

    except Exception as e:
        print(f"❌ Signup failed: {e}")
        driver.save_screenshot("signup_failed.png")
        return False

def test_user_dashboard_reached(driver):
    """Confirm we landed on User Dashboard after login"""
    try:
        wait = WebDriverWait(driver, 15)
        wait.until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "user_dashboard_title")),
            message="User Dashboard title not found"
        )
        print("✅ Reached User Dashboard!")
        return True
    except Exception as e:
        print(f"❌ User Dashboard not reached: {e}")
        driver.save_screenshot("user_dashboard_not_found.png")
        return False

def test_add_to_cart_and_checkout(driver):
    """Add the first available product to cart, open cart, and checkout"""
    try:
        print("\n🛒 Testing Add to Cart + Checkout...")
        wait = WebDriverWait(driver, 15)

        add_buttons = driver.find_elements(
            AppiumBy.ANDROID_UIAUTOMATOR,
            'new UiSelector().descriptionStartsWith("add_to_cart_button_")'
        )

        if not add_buttons:
            print("❌ No products found to add to cart. Add a product as admin first.")
            driver.save_screenshot("no_products_for_cart.png")
            return False

        print(f"📦 Found {len(add_buttons)} product(s). Adding the first one to cart...")
        add_buttons[0].click()
        time.sleep(1)

        cart_btn = wait.until(
            EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "cart_button")),
            message="Cart button not found"
        )
        cart_btn.click()
        time.sleep(1)

        checkout_btn = wait.until(
            EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "checkout_button")),
            message="Checkout button not found"
        )
        checkout_btn.click()
        time.sleep(2)

        print("✅ Checkout completed!")
        driver.save_screenshot("checkout_result.png")
        return True

    except Exception as e:
        print(f"❌ Add to Cart / Checkout test failed: {e}")
        driver.save_screenshot("cart_checkout_failed.png")
        return False

def main():
    """Main test runner: Admin flow followed by User flow"""
    driver = None
    try:
        driver = setup_driver()

        # ---------- ADMIN FLOW ----------
        print("\n========== ADMIN FLOW ==========")
        if test_login(driver, "admin@test.com", "admin123") and test_admin_dashboard_reached(driver):
            print("✅ ADMIN LOGIN PASSED!")
            test_add_product(driver)
        else:
            print("❌ ADMIN LOGIN FAILED! Stopping.")
            return

        test_logout(driver)

        # ---------- USER FLOW ----------
        print("\n========== USER FLOW ==========")
        test_user_email = "testuser@test.com"
        test_user_password = "test123"

        test_signup_user(driver, test_user_email, test_user_password)

        if test_login(driver, test_user_email, test_user_password) and test_user_dashboard_reached(driver):
            print("✅ USER LOGIN PASSED!")
            test_add_to_cart_and_checkout(driver)
        else:
            print("❌ USER LOGIN FAILED!")

    except Exception as e:
        print(f"\n💥 Critical error: {e}")
    finally:
        if driver:
            print("\n🛑 Closing driver...")
            driver.quit()

        input("\n Press Enter to close...")

if __name__ == "__main__":
    main()
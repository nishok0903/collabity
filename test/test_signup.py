import unittest
import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def random_string(length=6):
    return ''.join(random.choices(string.ascii_lowercase, k=length))


def random_email():
    return f"{random_string()}_{random.randint(100, 999)}@example.com"


def random_phone():
    return "9" + ''.join(random.choices(string.digits, k=9))


class RegistrationFlowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()
        cls.driver.maximize_window()
        cls.wait = WebDriverWait(cls.driver, 3)
        cls.base_url = "http://localhost:3000"

    def test_full_registration_process(self):
        driver = self.driver
        wait = self.wait
        driver.get(f"{self.base_url}/")

        # Step 1: Check if already logged in — look for sidebar logout button
        try:
            logout_button = wait.until(EC.presence_of_element_located(
                (By.XPATH, '//button[text()="Sign out"]')))
            logout_button.click()
            wait.until(EC.url_contains("/login"))
        except Exception:
            print("User was not logged in, continuing...")

        # Step 2: From login page, click 'Sign Up' link
        wait.until(EC.presence_of_element_located(
            (By.LINK_TEXT, "Sign Up"))).click()
        wait.until(EC.url_contains("/signup"))

        # Step 3: Fill Sign-Up form
        email = random_email()
        password = "Test@1234"

        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[type="email"]'))).send_keys(email)
        driver.find_element(
            By.CSS_SELECTOR, 'input[placeholder="Password"]').send_keys(password)
        driver.find_element(
            By.CSS_SELECTOR, 'input[placeholder="Confirm Password"]').send_keys(password)
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

        # Step 4: Wait for redirect to /enterDetails/...
        wait.until(EC.url_contains("/enterDetails"))

        # Step 5: Fill the enter details form
        username = random_string()
        first_name = random.choice(["Alice", "Bob", "Charlie"])
        last_name = random.choice(["Smith", "Johnson", "Brown"])
        dob = "1995-08-15"

        wait.until(EC.presence_of_element_located(
            (By.NAME, "username"))).send_keys(username)
        driver.find_element(By.NAME, "first_name").send_keys(first_name)
        driver.find_element(By.NAME, "last_name").send_keys(last_name)
        driver.find_element(By.NAME, "phone_number").send_keys(random_phone())
        driver.find_element(By.NAME, "address").send_keys("123 Random Street")
        driver.find_element(By.NAME, "linkedin_link").send_keys(
            f"https://linkedin.com/in/{username}")

        # Fix: Set DOB using JavaScript
        dob_input = driver.find_element(By.NAME, "date_of_birth")
        driver.execute_script(
            "arguments[0].value = arguments[1]", dob_input, dob)

        # Select gender
        gender_select = driver.find_element(By.NAME, "gender")
        gender_select.find_elements(By.TAG_NAME, "option")[
            1].click()  # e.g., male

        # Wait for tags to load, then select up to 2 tags
        time.sleep(1.5)
        tags = driver.find_elements(By.CSS_SELECTOR, "button.bg-gray-300")
        for tag in tags[:2]:
            tag.click()

        print(f"\n🔍 Submitting details for:\n"
              f"  Email: {email}\n"
              f"  Username: {username}\n"
              f"  Name: {first_name} {last_name}\n"
              f"  Phone: {random_phone()}\n"
              f"  DOB: {dob}\n")

        # Submit form
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

        # Step 6: Handle alert if it appears
        try:
            WebDriverWait(driver, 5).until(EC.alert_is_present())
            alert = driver.switch_to.alert
            print(f"⚠️ Alert appeared: {alert.text}")
            alert.accept()
            print("✅ Alert accepted.")
        except Exception:
            print("ℹ️ No alert appeared after submission.")

       # Step 7: Verify redirect to login
        try:
            wait.until(EC.url_contains("/login"))
            self.assertIn("/login", driver.current_url)
            print(
                f"✅ Successfully registered and redirected to login as {email}")
        except Exception as e:
            print(f"❌ Registration failed or not redirected to login.\n{e}")
            print("⚠️ Keeping browser open for manual inspection...")
            while True:
                time.sleep(10)

    @classmethod
    def tearDownClass(cls):
        pass  # Don't close browser on error; allow manual inspection


if __name__ == "__main__":
    unittest.main()

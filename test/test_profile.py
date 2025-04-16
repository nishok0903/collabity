import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class ProfilePageTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()
        cls.driver.maximize_window()
        cls.wait = WebDriverWait(cls.driver, 15)
        cls.base_url = "http://localhost:3000"
        cls.existing_user = {
            "email": "tbweqx_345@example.com",  # Replace with valid login
            "password": "Test@1234",            # Replace with correct password
            "username": "nishok"                    # Replace with actual username in DB
        }

    def test_view_profile_page(self):
        driver = self.driver
        wait = self.wait

        try:
            # Step 1: Visit login page
            driver.get(f"{self.base_url}/login")
            wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, 'input[type="email"]')))

            # Step 2: Log in
            driver.find_element(By.CSS_SELECTOR, 'input[type="email"]').send_keys(
                self.existing_user["email"])
            driver.find_element(By.CSS_SELECTOR, 'input[placeholder="Password"]').send_keys(
                self.existing_user["password"])
            driver.find_element(
                By.CSS_SELECTOR, 'button[type="submit"]').click()

            try:
                WebDriverWait(driver, 5).until(EC.alert_is_present())
                alert = driver.switch_to.alert
                print("⚠️ Alert appeared:", alert.text)
                alert.accept()  # Accept the alert to dismiss it
            except:
                print(" No unexpected alert appeared.")

            # Wait for dashboard or sidebar to appear
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//button[text()='Sign out']")))

            print(f"Logged in as {self.existing_user['email']}")

            # Step 3: Navigate to user profile directly
            profile_url = f"{self.base_url}/profile/{self.existing_user['username']}"
            driver.get(profile_url)
            time.sleep(4)

        except Exception as e:
            print(f"\n Error while accessing profile page:\n{e}")
            print(" Keeping browser open for manual inspection...")
            while True:
                time.sleep(10)  # Wait for user inspection

    @classmethod
    def tearDownClass(cls):
        pass  # Do not close browser if there's a failure or for manual inspection


if __name__ == "__main__":
    unittest.main()

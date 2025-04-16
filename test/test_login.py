import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class LoginTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()  # Or webdriver.Firefox(), etc.
        cls.driver.get("http://localhost:3000/")
        cls.wait = WebDriverWait(cls.driver, 15)

    # def test_login_failure(self):
    #     driver = self.driver
    #     wait = self.wait

    #     # Refresh the page
    #     driver.get("http://localhost:3000/")

    #     # Fill in invalid email
    #     email_input = wait.until(EC.presence_of_element_located(
    #         (By.CSS_SELECTOR, 'input[type="email"][placeholder="Email"]')
    #     ))
    #     email_input.clear()
    #     email_input.send_keys("invalid@example.com")

    #     # Fill in invalid password
    #     password_input = driver.find_element(
    #         By.CSS_SELECTOR, 'input[placeholder="Password"]')
    #     password_input.clear()
    #     password_input.send_keys("wrongPassword")

    #     # Click login
    #     submit_button = wait.until(EC.element_to_be_clickable(
    #         (By.CSS_SELECTOR, 'button[type="submit"]')
    #     ))
    #     submit_button.click()

    #     # Handle alert for failed login
    #     alert = wait.until(EC.alert_is_present())
    #     self.assertIn("failed to log in", alert.text.lower())
    #     alert.accept()

    #     # Optional: check error message on the form
    #     try:
    #         error_message = wait.until(
    #             EC.presence_of_element_located((By.CLASS_NAME, "text-red-500"))
    #         )
    #         self.assertIn("Failed", error_message.text)
    #     except:
    #         pass  # Not all login errors render a message on the form

    def test_login_success(self):
        driver = self.driver
        wait = self.wait

        # Fill in email
        email_input = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[type="email"][placeholder="Email"]')
        ))
        email_input.clear()
        email_input.send_keys("trial@coll.test")  # Replace with a valid user

        # Fill in password
        password_input = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[placeholder="Password"]')
        ))
        password_input.clear()
        # Replace with a valid password
        password_input.send_keys("Test@1234")

        # Click login button
        submit_button = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, 'button[type="submit"]')
        ))
        submit_button.click()

        # Handle alert after successful login
        alert = wait.until(EC.alert_is_present())
        self.assertIn("logged in successfully", alert.text.lower())
        alert.accept()

        # Wait for successful redirect
        wait.until(
            EC.any_of(
                EC.url_contains("/feed"),
                EC.url_contains("/create-topic"),
            )
        )

        # Assert redirect occurred
        current_url = driver.current_url
        self.assertTrue(
            "/feed" in current_url or "/create-topic" in current_url,
            f"Expected redirect URL to contain '/feed' or '/create-topic', got: {current_url}"
        )

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()


if __name__ == "__main__":
    unittest.main()

import requests
import sys
import json
from datetime import datetime

class ElevageAPITester:
    def __init__(self, base_url="https://c924e8da-5b59-42c2-a221-9ada102ec70e.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_animal_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_get_animals(self):
        """Test getting all animals"""
        success, data = self.run_test("Get All Animals", "GET", "animals", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} animals")
            if len(data) > 0:
                print(f"   Sample animal: {data[0].get('name', 'Unknown')}")
        return success, data

    def test_get_stats(self):
        """Test getting statistics"""
        success, data = self.run_test("Get Statistics", "GET", "stats", 200)
        if success:
            print(f"   Total livestock: {data.get('total_livestock', 'N/A')}")
            print(f"   Poultry: {data.get('poultry', {}).get('count', 'N/A')}")
            print(f"   Pigs: {data.get('pigs', {}).get('count', 'N/A')}")
        return success, data

    def test_create_animal(self):
        """Test creating a new animal"""
        test_animal = {
            "name": "Test Animal",
            "category": "Test Category",
            "sex": "Mâle",
            "age": "30 jours",
            "weight": 2.5,
            "type": "poulet"
        }
        success, data = self.run_test("Create Animal", "POST", "animals", 201, test_animal)
        if success and 'id' in data:
            self.created_animal_id = data['id']
            print(f"   Created animal with ID: {self.created_animal_id}")
        return success, data

    def test_get_single_animal(self):
        """Test getting a single animal by ID"""
        if not self.created_animal_id:
            print("❌ Skipping - No animal ID available")
            return False, {}
        
        return self.run_test("Get Single Animal", "GET", f"animals/{self.created_animal_id}", 200)

    def test_update_animal(self):
        """Test updating an animal"""
        if not self.created_animal_id:
            print("❌ Skipping - No animal ID available")
            return False, {}
        
        update_data = {
            "name": "Updated Test Animal",
            "weight": 3.0,
            "status": "actif"
        }
        return self.run_test("Update Animal", "PUT", f"animals/{self.created_animal_id}", 200, update_data)

    def test_delete_animal(self):
        """Test deleting an animal"""
        if not self.created_animal_id:
            print("❌ Skipping - No animal ID available")
            return False, {}
        
        return self.run_test("Delete Animal", "DELETE", f"animals/{self.created_animal_id}", 200)

    def test_get_nonexistent_animal(self):
        """Test getting a non-existent animal (should return 404)"""
        fake_id = "nonexistent-id-12345"
        return self.run_test("Get Non-existent Animal", "GET", f"animals/{fake_id}", 404)

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Élevage la Providence API Tests")
        print("=" * 50)
        
        # Test basic endpoints
        self.test_root_endpoint()
        self.test_get_animals()
        self.test_get_stats()
        
        # Test CRUD operations
        self.test_create_animal()
        self.test_get_single_animal()
        self.test_update_animal()
        self.test_delete_animal()
        
        # Test error handling
        self.test_get_nonexistent_animal()
        
        # Print final results
        print("\n" + "=" * 50)
        print(f"📊 Final Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed. Check the issues above.")
            return False

def main():
    """Main function to run all tests"""
    tester = ElevageAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
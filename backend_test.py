import requests
import sys
import json
from datetime import datetime

class LivestockAPITester:
    def __init__(self, base_url="https://fed1ee26-b3f7-40fe-bbed-a9c3f51494c1.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_animals = []  # Track created animals for cleanup

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_get_initial_stats(self):
        """Test stats endpoint initially"""
        return self.run_test("Initial Stats", "GET", "api/stats", 200)

    def test_get_empty_animals(self):
        """Test getting animals when database is empty"""
        return self.run_test("Get Empty Animals List", "GET", "api/animals", 200)

    def test_create_chicken(self):
        """Test creating a chicken"""
        chicken_data = {
            "type": "poulet",
            "race": "Poule pondeuse",
            "sexe": "F",
            "date_naissance": "2024-01-15",
            "poids": 2.5,
            "nom": "Henriette",
            "notes": "Poule test pour les tests automatisés"
        }
        success, response = self.run_test("Create Chicken", "POST", "api/animals", 200, chicken_data)
        if success and 'id' in response:
            self.created_animals.append(response['id'])
            return True, response['id']
        return False, None

    def test_create_pig(self):
        """Test creating a pig"""
        pig_data = {
            "type": "porc",
            "race": "Landrace",
            "sexe": "M",
            "date_naissance": "2023-06-10",
            "poids": 120.0,
            "nom": "Cochonnet",
            "notes": "Porc test pour les tests automatisés"
        }
        success, response = self.run_test("Create Pig", "POST", "api/animals", 200, pig_data)
        if success and 'id' in response:
            self.created_animals.append(response['id'])
            return True, response['id']
        return False, None

    def test_get_all_animals(self):
        """Test getting all animals"""
        return self.run_test("Get All Animals", "GET", "api/animals", 200)

    def test_get_animals_by_type(self, animal_type):
        """Test filtering animals by type"""
        return self.run_test(f"Get {animal_type.title()} Animals", "GET", "api/animals", 200, params={"type": animal_type})

    def test_get_specific_animal(self, animal_id):
        """Test getting a specific animal by ID"""
        return self.run_test("Get Specific Animal", "GET", f"api/animals/{animal_id}", 200)

    def test_update_animal(self, animal_id):
        """Test updating an animal"""
        update_data = {
            "poids": 3.0,
            "notes": "Poids mis à jour lors des tests"
        }
        return self.run_test("Update Animal", "PUT", f"api/animals/{animal_id}", 200, update_data)

    def test_delete_animal(self, animal_id):
        """Test deleting an animal"""
        success, response = self.run_test("Delete Animal", "DELETE", f"api/animals/{animal_id}", 200)
        if success and animal_id in self.created_animals:
            self.created_animals.remove(animal_id)
        return success, response

    def test_get_updated_stats(self):
        """Test stats after adding animals"""
        return self.run_test("Updated Stats", "GET", "api/stats", 200)

    def cleanup_created_animals(self):
        """Clean up any remaining test animals"""
        print(f"\n🧹 Cleaning up {len(self.created_animals)} remaining test animals...")
        for animal_id in self.created_animals.copy():
            self.test_delete_animal(animal_id)

def main():
    print("🚀 Starting Livestock Management API Tests")
    print("=" * 60)
    
    # Setup
    tester = LivestockAPITester()
    
    try:
        # Test 1: Health Check
        success, _ = tester.test_health_check()
        if not success:
            print("❌ Health check failed, API may not be running")
            return 1

        # Test 2: Initial Stats
        tester.test_get_initial_stats()

        # Test 3: Get empty animals list
        tester.test_get_empty_animals()

        # Test 4: Create a chicken
        chicken_success, chicken_id = tester.test_create_chicken()
        if not chicken_success:
            print("❌ Failed to create chicken, stopping tests")
            return 1

        # Test 5: Create a pig
        pig_success, pig_id = tester.test_create_pig()
        if not pig_success:
            print("❌ Failed to create pig, stopping tests")
            return 1

        # Test 6: Get all animals (should have 2 now)
        tester.test_get_all_animals()

        # Test 7: Filter by chicken type
        tester.test_get_animals_by_type("poulet")

        # Test 8: Filter by pig type
        tester.test_get_animals_by_type("porc")

        # Test 9: Get specific animal
        if chicken_id:
            tester.test_get_specific_animal(chicken_id)

        # Test 10: Update animal
        if chicken_id:
            tester.test_update_animal(chicken_id)

        # Test 11: Get updated stats
        tester.test_get_updated_stats()

        # Test 12: Delete one animal
        if pig_id:
            tester.test_delete_animal(pig_id)

        # Test 13: Verify deletion worked
        tester.test_get_all_animals()

        # Test 14: Final stats check
        tester.test_get_updated_stats()

    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
    finally:
        # Cleanup any remaining test animals
        tester.cleanup_created_animals()

    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print(f"⚠️ {tester.tests_run - tester.tests_passed} tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
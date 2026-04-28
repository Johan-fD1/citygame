#!/usr/bin/env python3
"""
City Game - Create and simulate your city through historical events.
"""

import random

class CityGame:
    def __init__(self):
        self.city_data = {}

    def ask_questions(self):
        print("Welcome to City Game! I'm your AI assistant. Let's create your city.")
        print()

        # Ask for basic info
        self.city_data['country'] = input("What country is your city in? ")
        self.city_data['population'] = input("What is the population size of your city? (e.g., 100000) ")
        self.city_data['area'] = input("What is the area of your city in square kilometers? (e.g., 500) ")

        # Ask for features on 1-10 scale
        features = ['transportation', 'safety', 'government', 'utilities']
        for feature in features:
            while True:
                try:
                    value = int(input(f"On a scale of 1-10, how much {feature} does your city have? "))
                    if 1 <= value <= 10:
                        self.city_data[feature] = value
                        break
                    else:
                        print("Please enter a number between 1 and 10.")
                except ValueError:
                    print("Please enter a valid number.")

    def generate_city(self):
        print("\nGenerating your city based on the provided information...")
        print()

        # Generate city description based on inputs
        country = self.city_data['country']
        population = self.city_data['population']
        area = self.city_data['area']

        # Calculate some derived stats
        density = int(population) / int(area) if int(area) > 0 else 0

        # Describe based on features
        def get_description(feature, level):
            if feature == 'transportation':
                if level <= 3:
                    return "has very poor transportation infrastructure, with few roads and limited public transit."
                elif level <= 7:
                    return "has moderate transportation options, including some buses and basic road networks."
                else:
                    return "has excellent transportation systems, with extensive metro lines, highways, and efficient public transport."
            elif feature == 'safety':
                if level <= 3:
                    return "is quite unsafe, with high crime rates and little law enforcement presence."
                elif level <= 7:
                    return "has average safety levels, with some crime but generally secure neighborhoods."
                else:
                    return "is very safe, with low crime rates and strong community policing."
            elif feature == 'government':
                if level <= 3:
                    return "has a weak government, with corruption and inefficient services."
                elif level <= 7:
                    return "has a functional government that provides basic services adequately."
                else:
                    return "has an excellent government, with transparent, efficient, and citizen-focused administration."
            elif feature == 'utilities':
                if level <= 3:
                    return "lacks basic utilities, with frequent power outages and water shortages."
                elif level <= 7:
                    return "has adequate utilities, with reliable but not exceptional service."
                else:
                    return "has top-notch utilities, with constant power, clean water, and advanced infrastructure."
            return "has unknown levels of this feature."

        print(f"Your city is located in {country}.")
        print(f"It has a population of {population} people and covers an area of {area} square kilometers.")
        print(f"Population density: {density:.2f} people per square kilometer.")
        print()

        for feature in ['transportation', 'safety', 'government', 'utilities']:
            level = self.city_data[feature]
            desc = get_description(feature, level)
            print(f"The city {desc}")

        print("\nNow, let's simulate some historical events...")

    def simulate_events(self):
        # Simple simulation: random events based on city features
        events = [
            "A major earthquake strikes! How does your city respond?",
            "An economic boom increases population growth.",
            "A pandemic affects the city's health systems.",
            "New technology improves transportation.",
            "Political changes affect government stability."
        ]

        # Weight events based on city features
        weights = []
        for _ in events:
            weight = sum(self.city_data[feat] for feat in ['transportation', 'safety', 'government', 'utilities']) / 40  # average /10
            weights.append(weight)

        # Simulate a few events
        for i in range(3):
            event = random.choices(events, weights=weights)[0]
            print(f"Event {i+1}: {event}")

        print("\nSimulation complete. Your city has evolved!")

def main():
    game = CityGame()
    game.ask_questions()
    game.generate_city()
    game.simulate_events()

if __name__ == "__main__":
    main()
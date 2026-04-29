#!/usr/bin/env python3
"""
City Game - Create and simulate your city through historical events.
"""

import random
import time


class CityGame:
    def __init__(self):
        self.city_data = {}
        self.state = None
        self.actions = []

    def ask_questions(self):
        print("Welcome to City Game! I'm your AI assistant. Let's create your city.")
        print()

        # Ask for basic info
        self.city_data['name'] = input("What is the name of your city? ") or 'Unnamed City'
        self.city_data['country'] = input("What country is your city in? ") or 'Unknown'
        while True:
            try:
                self.city_data['population'] = int(input("What is the population size of your city? (e.g., 100000) "))
                break
            except ValueError:
                print("Please enter an integer population.")
        while True:
            try:
                self.city_data['area'] = float(input("What is the area of your city in square kilometers? (e.g., 500) "))
                break
            except ValueError:
                print("Please enter a numeric area.")

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

        population = self.city_data['population']
        area = self.city_data['area']
        density = population / area if area > 0 else 0

        # initialize runtime state
        self.state = {
            'name': self.city_data.get('name', 'Unnamed City'),
            'country': self.city_data.get('country', 'Unknown'),
            'population': population,
            'area': area,
            'density': density,
            'transportation': int(self.city_data['transportation']),
            'safety': int(self.city_data['safety']),
            'government': int(self.city_data['government']),
            'utilities': int(self.city_data['utilities']),
            'economy': max(1000, round(((int(self.city_data['transportation']) + int(self.city_data['utilities']) + int(self.city_data['government'])) / 30) * population)),
            'happiness': round((int(self.city_data['safety']) + int(self.city_data['utilities'])) * 5),
            'crime': max(0, 10 - int(self.city_data['safety'])),
            'day': 0,
            'mode': 'normal',
            'game_over': False,
            'special_strength': 0
        }

        print(f"Your city {self.state['name']} is located in {self.state['country']}.")
        print(f"It has a population of {self.state['population']} people and covers an area of {self.state['area']} square kilometers.")
        print(f"Population density: {self.state['density']:.2f} people per square kilometer.")
        print()

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

        for feature in ['transportation', 'safety', 'government', 'utilities']:
            level = self.city_data[feature]
            desc = get_description(feature, level)
            print(f"The city {desc}")

        print("\nNow, let's simulate your city. Use 'help' for commands.")

    def print_stats(self):
        s = self.state
        print('\n--- City Statistics ---')
        print(f"Name: {s['name']}")
        print(f"Country: {s['country']}")
        print(f"Day: {s['day']}")
        print(f"Population: {s['population']}")
        print(f"Economy: ${s['economy']}")
        print(f"Density: {s['density']:.2f} ppl/km^2")
        print(f"Transportation: {s['transportation']}/10")
        print(f"Safety: {s['safety']}/10")
        print(f"Government: {s['government']}/10")
        print(f"Utilities: {s['utilities']}/10")
        print(f"Happiness: {s['happiness']}/100")
        print(f"Crime index: {s['crime']}/10")
        print('-----------------------\n')

    def simulate(self, days=1):
        # simulate day-by-day
        for _ in range(days):
            self.state['day'] += 1
            # population change
            pop = self.state['population']
            growth = max(-0.01, min(0.01, (self.state['economy'] / max(100000, pop)) * 0.0005 + (self.state['happiness'] - 50) * 0.00002))
            self.state['population'] = max(10, int(self.state['population'] * (1 + growth)))
            self.state['density'] = self.state['population'] / self.state['area'] if self.state['area'] > 0 else 0

            # economy drift
            econ_drift = ((self.state['transportation'] + self.state['utilities'] + self.state['government']) - 15) * 0.001 + (random.random() - 0.5) * 0.002
            self.state['economy'] = max(100, int(self.state['economy'] * (1 + econ_drift)))

            # happiness & crime
            self.state['happiness'] = max(0, min(100, int(self.state['happiness'] + (self.state['utilities'] - 5) * 0.02 + (self.state['safety'] - 5) * 0.03 + (random.random() - 0.5))))
            self.state['crime'] = max(0, min(10, int(10 - self.state['safety'] + (random.random() - 0.4) * 1.5)))

            # event chance
            base_chance = 0.005
            risk = (10 - self.state['government']) * 0.002 + (10 - self.state['utilities']) * 0.001 + (10 - self.state['safety']) * 0.001
            event_prob = min(0.2, base_chance + risk)
            if random.random() < event_prob:
                ev = self.generate_event()
                self.apply_event(ev)
                print(f"Day {self.state['day']}: {ev['text']}")

        # after simulation period, print stats
        self.print_stats()

    def generate_event(self):
        events = [
            {'id': 'natural_disaster', 'text': 'Natural disaster damages infrastructure.', 'effect': lambda s: (s.update({'utilities': max(1, s['utilities'] - 2), 'population': int(s['population'] * 0.995), 'economy': int(s['economy'] * 0.9)}))},
            {'id': 'gang_war', 'text': 'Gang war increases crime and damages property.', 'effect': lambda s: (s.update({'safety': max(1, s['safety'] - 3), 'crime': min(10, s['crime'] + 3), 'economy': int(s['economy'] * 0.95)}))},
            {'id': 'scandal', 'text': 'Political scandal reduces trust and causes protests.', 'effect': lambda s: (s.update({'government': max(1, s['government'] - 2), 'happiness': max(0, s['happiness'] - 5)}))},
            {'id': 'blackout', 'text': 'Blackout disrupts services and industry.', 'effect': lambda s: (s.update({'utilities': max(1, s['utilities'] - 2), 'economy': int(s['economy'] * 0.97)}))},
            {'id': 'boom', 'text': 'Economic boom increases investment and population.', 'effect': lambda s: (s.update({'economy': int(s['economy'] * (1 + 0.08 * random.random())), 'population': int(s['population'] * (1 + 0.002 * random.random())), 'happiness': min(100, s['happiness'] + 1)}))},
            {'id': 'festival', 'text': 'Festival boosts happiness and tourism.', 'effect': lambda s: (s.update({'happiness': min(100, s['happiness'] + 3), 'economy': int(s['economy'] * 1.01)}))},
            {'id': 'infrastructure_failure', 'text': 'Infrastructure failure disrupts transport and commerce.', 'effect': lambda s: (s.update({'transportation': max(1, s['transportation'] - 2), 'economy': int(s['economy'] * 0.96)}))},
            {'id': 'scandal_financial', 'text': 'Financial scandal shakes markets and firms.', 'effect': lambda s: (s.update({'economy': int(s['economy'] * 0.94), 'happiness': max(0, s['happiness'] - 3)}))},
            {'id': 'shibuya', 'text': 'Shibuya Incident; 100,000 people will die if this occurs.', 'effect': self.apply_shibuya},
            {'id': 'third_impact', 'text': 'Third Impact; everyone will die.', 'effect': self.apply_third_impact},
            {'id': 'viltrumite_war', 'text': 'Viltrumite War; everyone becomes Viltrumites and takes over the world.', 'effect': self.apply_viltrumite_war},
            {'id': 'judgment_day', 'text': 'Judgment Day (Terminator); half the population will die and the rest must fight back.', 'effect': self.apply_judgment_day},
            {'id': 'world_war_z', 'text': 'World War Z; undead invasion threatens your city.', 'effect': self.apply_world_war_z}
        ]

        # weights influenced by state
        weights = []
        for ev in events:
            w = 1.0
            if ev['id'] == 'natural_disaster':
                w = 0.6 + (10 - self.state['utilities']) / 10
            if ev['id'] == 'gang_war':
                w = 0.5 + self.state['crime'] / 3 + (10 - self.state['safety']) / 4 + (10 - self.state['government']) / 6
            if ev['id'] == 'scandal':
                w = 0.3 + (10 - self.state['government']) / 3
            if ev['id'] == 'blackout':
                w = 0.4 + (10 - self.state['utilities']) / 3
            if ev['id'] == 'boom':
                w = 0.2 + self.state['economy'] / max(100000, self.state['population']) / 10
            if ev['id'] == 'festival':
                w = 0.1 + self.state['happiness'] / 50
            if ev['id'] == 'infrastructure_failure':
                w = 0.2 + (10 - self.state['transportation']) / 4
            if ev['id'] == 'scandal_financial':
                w = 0.2 + (10 - self.state['government']) / 5 + random.random()
            if ev['id'] == 'shibuya':
                w = 0.15 + (10 - self.state['government']) / 20 + (10 - self.state['utilities']) / 40
            if ev['id'] == 'third_impact':
                w = 0.08 + (10 - self.state['utilities']) / 50
            if ev['id'] == 'viltrumite_war':
                w = 0.06 + (self.state['transportation'] + self.state['government']) / 40
            if ev['id'] == 'judgment_day':
                w = 0.07 + (10 - self.state['safety']) / 20 + (10 - self.state['government']) / 30
            if ev['id'] == 'world_war_z':
                w = 0.06 + (10 - self.state['utilities']) / 30 + (10 - self.state['government']) / 40

            # actions reduce some risks
            for a in self.actions:
                if a == 'build_power_plant' and ev['id'] == 'blackout':
                    w *= 0.4
                if a == 'increase_police' and ev['id'] == 'gang_war':
                    w *= 0.6
                if a == 'anti_corruption' and ev['id'] == 'scandal':
                    w *= 0.5
                if a == 'invest_transport' and ev['id'] == 'infrastructure_failure':
                    w *= 0.7

            weights.append(max(0.01, w))

        # pick
        total = sum(weights)
        r = random.random() * total
        for i, ev in enumerate(events):
            r -= weights[i]
            if r <= 0:
                return ev
        return events[-1]

    def apply_event(self, ev):
        ev['effect'](self.state)

    def apply_action(self, action):
        # record action and apply immediate effects
        self.actions.append(action)
        if action == 'build_power_plant':
            self.state['utilities'] = min(10, self.state['utilities'] + 3)
            self.state['economy'] = max(0, int(self.state['economy'] * 0.98))
        elif action == 'increase_police':
            self.state['safety'] = min(10, self.state['safety'] + 2)
            self.state['economy'] = max(0, int(self.state['economy'] * 0.995))
        elif action == 'invest_transport':
            self.state['transportation'] = min(10, self.state['transportation'] + 2)
            self.state['economy'] = max(0, int(self.state['economy'] * 0.98))
        elif action == 'tax_cuts':
            self.state['happiness'] = min(100, self.state['happiness'] + 4)
            self.state['government'] = max(1, self.state['government'] - 1)
            self.state['economy'] = max(0, int(self.state['economy'] * 0.99))
        elif action == 'anti_corruption':
            self.state['government'] = min(10, self.state['government'] + 3)
            self.state['happiness'] = min(100, self.state['happiness'] + 2)
        elif action == 'build_park':
            self.state['happiness'] = min(100, self.state['happiness'] + 3)
            self.state['economy'] = max(0, int(self.state['economy'] * 0.995))

    def repl(self):
        print("Enter commands: 'sim [n days|months|years]', 'stats', 'action [name]', 'help', 'quit'")
        while True:
            cmd = input('> ').strip().lower()
            if cmd in ('quit', 'exit'):
                print('Goodbye!')
                break
            if cmd == 'help':
                print("Commands:\n  sim [number] [days|months|years] - advance simulation\n  stats - show city stats\n  action [build_power_plant|increase_police|invest_transport|tax_cuts|anti_corruption|build_park] - apply policy\n  quit - exit")
                continue
            if cmd.startswith('sim'):
                parts = cmd.split()
                if len(parts) < 2:
                    print('Usage: sim [number] [days|months|years]')
                    continue
                try:
                    n = int(parts[1])
                except ValueError:
                    print('First arg must be an integer')
                    continue
                unit = 'days'
                if len(parts) >= 3:
                    unit = parts[2]
                days = n
                if unit.startswith('month'):
                    days = n * 30
                if unit.startswith('year'):
                    days = n * 365
                print(f'Advancing {days} days...')
                # simulate in chunks so user sees progress
                chunk = max(1, days // 50)
                simulated = 0
                while simulated < days:
                    to_run = min(chunk, days - simulated)
                    self.simulate(to_run)
                    simulated += to_run
                    print(f'Progress: {simulated}/{days} days')
                continue
            if cmd == 'stats':
                self.print_stats()
                continue
            if cmd.startswith('action'):
                parts = cmd.split()
                if len(parts) < 2:
                    print('Usage: action [name]')
                    continue
                name = parts[1]
                valid = ['build_power_plant', 'increase_police', 'invest_transport', 'tax_cuts', 'anti_corruption', 'build_park']
                if name not in valid:
                    print('Unknown action. See help.')
                    continue
                self.apply_action(name)
                print(f'Applied action {name}.')
                continue
            print('Unknown command. Type help for options.')

def main():
    game = CityGame()
    game.ask_questions()
    game.generate_city()
    game.simulate_events()

if __name__ == "__main__":
    main()
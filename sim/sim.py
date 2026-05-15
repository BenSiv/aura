import random
import uuid
import math
from collections import defaultdict

class Agent:
    def __init__(self, name, behavior='honest'):
        self.id = str(uuid.uuid4())[:8]
        self.name = name
        self.behavior = behavior
        self.active = True
        self.x = random.uniform(0, 100)
        self.y = random.uniform(0, 100)
        
        # Quality agents have higher base traits
        base_val = 0.7 if behavior == 'quality' else 0.4
        self.traits = {
            'kindness': random.uniform(base_val, 1.0) if behavior != 'troll' else random.uniform(0, 0.2),
            'energy': random.random(),
            'intellect': random.random()
        }
        self.preferences = {
            'kindness': random.uniform(0.6, 1.0),
            'energy': random.uniform(0.4, 0.8),
            'intellect': random.uniform(0.4, 0.8)
        }

    def move(self):
        if not self.active: return
        self.x = (self.x + random.uniform(-5, 5)) % 100
        self.y = (self.y + random.uniform(-5, 5)) % 100

class Mesh:
    def __init__(self):
        self.agents = []
        self.reputation = defaultdict(list)
        self.mutual_matches = set() # (id1, id2)

    def step(self):
        for a in self.agents:
            if random.random() < 0.02: a.active = not a.active
            a.move()

        active = [a for a in self.agents if a.active]
        for i, a in enumerate(active):
            for b in active[i+1:]:
                dist = math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
                if dist < 20:
                    self.process_encounter(a, b)

    def process_encounter(self, a, b):
        def evaluate(me, them):
            score = sum(them.traits[t] * me.preferences[t] for t in me.preferences) / len(me.preferences)
            if me.behavior == 'troll': return 'negative'
            return 'positive' if score > 0.5 else 'negative'

        a_rank_b = evaluate(a, b)
        b_rank_a = evaluate(b, a)

        # MUTUAL RESONANCE: If both like each other, they form a trust bond
        if a_rank_b == 'positive' and b_rank_a == 'positive':
            self.mutual_matches.add(tuple(sorted((a.id, b.id))))

        # Record feedback
        self.reputation[b.id].append((a.id, a_rank_b))
        self.reputation[a.id].append((b.id, b_rank_a))

    def get_score(self, agent_id):
        fb = self.reputation[agent_id]
        if not fb: return 1.0
        
        score = 1.0
        for reporter_id, rating in fb:
            # TRUST DEFENSE:
            # 1. Negative feedback from a stranger (non-mutual) is weighted 0.1
            # 2. Positive feedback from a mutual match is weighted 2.0
            
            is_mutual = tuple(sorted((agent_id, reporter_id))) in self.mutual_matches
            
            if rating == 'positive':
                weight = 2.0 if is_mutual else 1.0
                score += (0.1 * weight)
            else:
                weight = 0.1 if not is_mutual else 1.5 # Strangers can't tank you
                score -= (0.2 * weight)
                
        return max(0.1, min(score, 5.0))

    def report(self, step):
        print(f"\n[Step {step}] Aura Simulation: Trust Clusters")
        print("-" * 80)
        print(f"{'Type':8} | {'Name':8} | {'Score':6} | {'Signals':10} | {'Mutuals'}")
        print("-" * 80)
        for a in sorted(self.agents, key=lambda x: self.get_score(x.id), reverse=True):
            score = self.get_score(a.id)
            fb = self.reputation[a.id]
            p = len([f for f in fb if f[1] == 'positive'])
            n = len([f for f in fb if f[1] == 'negative'])
            m = len([pair for pair in self.mutual_matches if a.id in pair])
            print(f"{a.behavior.upper():8} | {a.name:8} | {score:6.2f} | +{p}/-{n:3} | {m}")

def main():
    m = Mesh()
    # Add 15 agents
    names = ["Alice", "Bob", "Charlie", "Dana", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy"]
    for n in names: m.agents.append(Agent(n, 'honest'))
    m.agents.append(Agent("Quality1", 'quality'))
    m.agents.append(Agent("Quality2", 'quality'))
    m.agents.append(Agent("Troll1", 'troll'))
    m.agents.append(Agent("Troll2", 'troll'))
    m.agents.append(Agent("Troll3", 'troll'))

    for i in range(101):
        m.step()
        if i % 25 == 0: m.report(i)

if __name__ == "__main__":
    main()

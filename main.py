import core
from preypredator.predator import Predator
from preypredator.prey import Prey


def setup():
    print("Setup START---------")
    core.fps = 30
    core.WINDOW_SIZE = [800, 800]

    core.memory("preys", [])
    core.memory("preysNb",100)

    core.memory("predators", [])
    core.memory("predatorsNb", 10)

    for i in range(0,core.memory("preysNb")):
        core.memory("preys").append(Prey())
    for i in range(0,core.memory("predatorsNb")):
        core.memory("predators").append(Predator())

    print("Setup END-----------")


def reset():
    core.memory("preys", [])
    core.memory("predators", [])
    for i in range(0,core.memory("preysNb")):
        core.memory("preys").append(Prey())
    for i in range(0,core.memory("predatorsNb")):
        core.memory("predators").append(Predator())

def run():
    core.cleanScreen()
    if core.getKeyPressList("r"):
        reset()

    for prey in core.memory("preys"):
        if core.getMouseLeftClick():
           prey.repultion(core.getMouseLeftClick())

        if core.getMouseRightClick():
           prey.attraction(core.getMouseRightClick())

        prey.edge(core.WINDOW_SIZE)

        prey.computeForce(core.memory("predators"))
        prey.update()
        prey.show()

    for predator in core.memory("predators"):
        if core.getMouseLeftClick():
           predator.repultion(core.getMouseLeftClick())

        if core.getMouseRightClick():
           predator.attraction(core.getMouseRightClick())

        predator.eat(core.memory("preys"))
        predator.computeForce(core.memory("preys"),core.memory("predators"))
        predator.edge(core.WINDOW_SIZE)
        predator.update()
        predator.show()


core.main(setup, run)
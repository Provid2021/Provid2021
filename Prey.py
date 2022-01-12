import random

from pygame.math import Vector2

import core


class Prey:
    def __init__(self):
        self.debug = False
        self.pos = Vector2(random.randint(0,800),random.randint(0,800))
        self.vel = Vector2(random.uniform(-5,5),random.uniform(-5,5))
        self.acc = Vector2()
        self.maxAcc=1
        self.maxSpeed=4
        self.perception = 60
        self.freeze = False



    def computeForce(self,predators):
        predatorsList = []
        for p in predators:
            if p.pos.distance_to(self.pos) < self.perception:
                predatorsList.append(p)

        f = self.fear(predatorsList)
        self.acc =self.acc - f

    def fear(self,predators):
        steering = Vector2()
        predatorCounter = 0
        for other in predators:
            if self.pos.distance_to(other.pos) != 0:
                diff = Vector2(other.pos.x - self.pos.x, other.pos.y - self.pos.y)
                if diff.length() > 0.001:
                    diff.scale_to_length(self.pos.distance_squared_to(other.pos))
                    predatorCounter += 1
                    steering += diff
            else:
                steering += Vector2(random.uniform(-5, 5), random.uniform(-5, 5))
                predatorCounter += 1

        if predatorCounter > 0:
            steering /= predatorCounter

            steering += self.vel

            if steering.length() > self.maxAcc:
                steering = steering.normalize()
                steering.scale_to_length(self.maxAcc)
        return steering

    def update(self):
        if not self.freeze:
            if self.acc.length() > self.maxAcc:
                self.acc.scale_to_length(self.maxAcc)

            self.vel+=self.acc
            if self.vel.length() > self.maxSpeed:
                self.vel.scale_to_length(self.maxSpeed)
            self.acc=Vector2(0,0)
            self.pos+=self.vel
        else:
            self.vel = Vector2()



    def repultion(self,obstacle):
        obstacleVect = Vector2(obstacle[0], obstacle[1])
        if obstacleVect.distance_to(self.pos) < self.perception*2:
            self.acc =   self.pos - obstacleVect

    def attraction(self,obstacle):
        obstacleVect = Vector2(obstacle[0], obstacle[1])
        if obstacleVect.distance_to(self.pos) < self.perception*2:
            self.acc =   obstacleVect  - self.pos

    def edge(self,sizes):
        if self.pos.x <=0:
            self.vel.x *= -1
            self.pos.x = 10
        if self.pos.x >= sizes[0]:
            self.vel.x *= -1
            self.pos.x = sizes[0] - 10
        if self.pos.y <= 0:
            self.vel.y *= -1
            self.pos.y = 10
        if self.pos.y >= sizes[1]:
            self.vel.y *= -1
            self.pos.y = sizes[1] - 10

    def show(self):
        a = 0 - self.vel.angle_to(Vector2(0,1))

        p1 = self.pos + Vector2(-5, 0).rotate(a)
        p2 = self.pos + Vector2(0, 15).rotate(a)
        p3 = self.pos + Vector2(5, 0).rotate(a)

        if self.freeze:
            core.Draw.polygon( (0,0,255), ((p1), (p2), (p3)))
        else:
            core.Draw.polygon( (0,255,0), ((p1), (p2), (p3)))

        if self.debug:
            core.Draw.line((255,255,255),self.pos,self.pos+self.co*50)
            core.Draw.line((255, 0, 0), self.pos, self.pos + self.se * 50)
            #pygame.draw.circle(screen,(255,255,255),self.pos,self.perception,1)
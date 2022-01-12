import random

from pygame.math import Vector2

import core


class Predator:
    def __init__(self):
        self.debug = False
        self.pos = Vector2(random.randint(0,800),random.randint(0,800))
        self.vel = Vector2(random.uniform(-5,5),random.uniform(-5,5))
        self.acc = Vector2()
        self.maxAcc=1
        self.maxSpeed=6
        self.perception = 80
        self.freeze = False
        self.prey = None
        self.huntFactor=0.4
        self.alignFactor = 0.1
        self.cohesionFactor = 2


    def eat(self,preys):
        for p in preys:
            if p.pos.distance_to(self.pos) < 10:
                p.freeze = True
                print("Eat")

    def computeForce(self, preys, predators):
        preysList = []
        for p in preys:
            if p.pos.distance_to(self.pos) < self.perception and not p.freeze:
                preysList.append(p)
        predatorsList = []
        for p in predators:
            if p.pos.distance_to(self.pos) < self.perception:
                predatorsList.append(p)

        co = self.cohesion(predatorsList) * self.cohesionFactor
        al = self.align(predatorsList) * self.alignFactor
        hu = self.hunt(preysList) * self.huntFactor

        self.acc = self.acc + hu + co + al

    def hunt(self, preysList):
        steering = Vector2()
        if len(preysList)>0:
            self.prey = sorted(preysList,key=lambda x: x.pos.distance_to(self.pos), reverse=True)[0]
            steering = self.prey.pos - self.pos
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

    def cohesion(self,boids):
        steering = Vector2()
        boidscounter = 0
        for other in boids:
            if self.pos.distance_to(other.pos) != 0:
                boidscounter += 1
                steering += other.pos

        if boidscounter > 0:
            steering /= boidscounter
            steering -= self.pos


            steering += self.vel
            if steering.length() > self.maxAcc:
                steering = steering.normalize()
                steering.scale_to_length(self.maxAcc)

        return steering

    def align(self,boids):
        steering = Vector2()
        boidscounter = 0
        for other in boids:
            boidscounter+=1
            steering+=other.vel

        if boidscounter>0:
            steering/=boidscounter

            steering -= self.vel
            if steering.length() > self.maxAcc:
                steering=steering.normalize()
                steering.scale_to_length(self.maxAcc)

        return steering



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
        if self.pos.x >= sizes[0]:
            self.vel.x *= -1
        if self.pos.y <= 0:
            self.vel.y *= -1
        if self.pos.y >= sizes[1]:
            self.vel.y *= -1

    def show(self):
        a = 0 - self.vel.angle_to(Vector2(0,1))

        p1 = self.pos + Vector2(-5, 0).rotate(a)
        p2 = self.pos + Vector2(0, 15).rotate(a)
        p3 = self.pos + Vector2(5, 0).rotate(a)

        core.Draw.polygon( (255,0,0), ((p1), (p2), (p3)))


        if self.debug:
            core.Draw.line((255,255,255),self.pos,self.pos+self.co*50)
            core.Draw.line((255, 0, 0), self.pos, self.pos + self.se * 50)
            core.Draw.circle((255,255,255),self.pos,self.perception,1)
            if self.prey:
                core.Draw.circle((255, 0, 0), self.prey.pos, 10, 1)
import pygame.draw
from pygame.math import Vector2

import core


class Case:
    def __init__(self,x,y):
        self.pos = Vector2(x,y)
        self.bee = False
        self.neighbor = 0
        self.w=40
        self.revealed=False
        self.myfont = pygame.font.SysFont('Comic Sans MS', 20)
        self.mark=False

    def computeNeighbor(self,w,h,grid):

        cpt=0
        if self.bee:
            self.neighbor= -1
            return

        for i in range(int(max(0,self.pos.x-1)),int(min(self.pos.x+2,w))):
            for j in range(int(max(0, self.pos.y - 1)), int(min(self.pos.y + 2, h))):
                if self.pos.x == i and self.pos.y == j:
                    print("same")
                else:
                    if grid[i][j].bee:
                        cpt+=1
        self.neighbor=cpt

        print("--", self.pos,self.neighbor)

    def revealNeighbor(self,w,h,grid):
        neighborList=[]
        for i in range(int(max(0,self.pos.x-1)),int(min(self.pos.x+2,w))):
            for j in range(int(max(0, self.pos.y - 1)), int(min(self.pos.y + 2, h))):
                print(i, j)
                if self.pos.x == i and self.pos.y == j:
                    print("same")
                else:
                    if self.neighbor==0 and grid[i][j].neighbor==0 and not grid[i][j].revealed and not grid[i][j].bee:
                        neighborList.append(grid[i][j])
                        print('add',i, j)
                    if grid[i][j].neighbor >= 0:
                        grid[i][j].revealed = True
                        print('revealed', i, j)
        return  neighborList

    def marked(self,clic):
        if self.pos.x*self.w < clic[0]<self.pos.x*self.w+self.w:
            if self.pos.y*self.w < clic[1]< self.pos.y*self.w+self.w:
                self.mark = not self.mark

    def inside(self,clic):
        if self.pos.x*self.w < clic[0]<self.pos.x*self.w+self.w:
            if self.pos.y*self.w < clic[1]< self.pos.y*self.w+self.w:
                self.revealed = True
                return self.bee,self.neighbor
        return None, None

    def show(self):
        core.Draw.rect((200, 200, 200), (self.pos.x * self.w, self.pos.y * self.w, self.w, self.w), 1)

        if self.mark:
            textsurface = self.myfont.render("x", False, (200, 200, 200))
            core.screen.blit(textsurface, (self.pos.x * self.w + 15, self.pos.y * self.w + 5))
        if self.revealed:
            if self.bee:
                core.Draw.rect((100,100,100),(self.pos.x*self.w,self.pos.y*self.w,self.w,self.w))
                core.Draw.circle((50,50,50),(self.pos.x*self.w+self.w/2,self.pos.y*self.w+self.w/2),10)
                core.Draw.rect((200,200,200),(self.pos.x*self.w,self.pos.y*self.w,self.w,self.w),1)
            else:
                core.Draw.rect((100,100,100),(self.pos.x*self.w,self.pos.y*self.w,self.w,self.w))
                core.Draw.rect((200,200,200),(self.pos.x*self.w,self.pos.y*self.w,self.w,self.w),1)
                if self.neighbor!=0:
                    textsurface = self.myfont.render(str(self.neighbor), False, (0, 0, 0))
                    core.screen.blit(textsurface, (self.pos.x*self.w+15,self.pos.y*self.w+5))
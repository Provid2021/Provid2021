from pygame.math import Vector2

import core


class Cell:
    def __init__(self,x,y,o,w=5):
        self.pos = Vector2(x,y)
        self.n=0
        self.occupied = bool(o)
        self.w=w


    def update(self,w,h,grid):
        n = self.computeNeighbor(w,h,grid)

        if self.occupied:
            if n == 2 or n == 3:
                return True
            else:
                return False
        else:
            if n==3:
                return True
        return None


    def computeNeighbor(self,w,h,grid):
        cpt=0
        for i in range(int(max(0,self.pos.x-1)),int(min(self.pos.x+2,w))):
            for j in range(int(max(0, self.pos.y - 1)), int(min(self.pos.y + 2, h))):
                if grid[i][j].occupied:
                    cpt+=1

        self.n= cpt - int(self.occupied)
        return self.n




    def marked(self,clic):
        if self.pos.x*self.w < clic[0]<self.pos.x*self.w+self.w:
            if self.pos.y*self.w < clic[1]< self.pos.y*self.w+self.w:
                self.mark = not self.mark

    def inside(self,clic):
        if self.pos.x*self.w < clic[0]<self.pos.x*self.w+self.w:
            if self.pos.y*self.w < clic[1]< self.pos.y*self.w+self.w:
                self.occupied = not self.occupied

    def show(self):
        #core.Draw.rect((0, 0, 0), (self.pos.x * self.w, self.pos.y * self.w, self.w, self.w), 1)
        if self.occupied:
            core.Draw.rect((0,0,0),(self.pos.x*self.w,self.pos.y*self.w,self.w,self.w))

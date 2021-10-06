import numpy as np
import json

mList = {'matrix':[]}
length = 15
count = 5
for i in range(count):
    rm = np.random.randint(0, 2, (length,length))
    for j in range (length // 10):
        tmp = np.random.randint(0, 2, (length, length))
        rm -= tmp
    rm = np.triu(rm)
    rm[rm < 0] = 0
    # print (rm)
    newlist = {}
    newlist['index'] = i
    newlist['nodes'] = length
    newlist['link'] = []
    for row in range(length):
        for col in range(length):
            if rm[row][col] and row != col:
                newlist["link"].append({'source': row, 'target': col})
    
    mList['matrix'].append(newlist)
fp = open('data/matrixs' + str(length) + '_' + str(count) + '.json', 'w')
json.dump(mList, fp)

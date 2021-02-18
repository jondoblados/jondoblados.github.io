---
title: 'changes for stf'
date: 2005-04-05T23:49:00.000+08:00
draft: false
aliases: [ "/2005/04/changes-for-stf.html" ]
---

  
*   1\. stf transactions (data entry) over the intranet had problems when solomon tries to do a "release now" action.
  
*   2\. further analysis by LPE shows that the intranet module hasn't completely emulated the "transfers" transaction of solomon, in that the items transferred did not have corresponding serialized entries in LotSerT
  
*   3\. relations: Batch 1:1 TrnsfrDoc, Batch 1:n INTran, INTran 1:n LotSerT
  
*   4\. look up for LotSerT.LotSerNbr will come from LotSerMst (where all serialized items are built up)
  
*   5\. `SELECT LotSerNbr FROM LotSerMst WHERE InvtId='1002122' AND SiteId='LOG-MCS' AND Status = 'A' AND WhseLoc='MAIN' AND QtyOnHand > 0 ORDER BY LotSerNbr ASC`
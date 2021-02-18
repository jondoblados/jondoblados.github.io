---
title: 'more stf blues'
date: 2005-04-07T23:47:00.000+08:00
draft: false
aliases: [ "/2005/04/more-stf-blues.html" ]
---

  
*   1\. test batch nos. 003442 (solomon) and 003444 (intra)
  
  
*   2\. per InvtID, pick up LotSerNbr(s) as required or set by needed quantity, and insert corresponding number of rows in LotSerT
  
  
*   3\. if i will require 3 serials, then the top non-zero LotSerNbr's will be retrieved and inserted accordingly to LotSerT
  
  
*   4\. during release by solomon, QtyOnHand will be set to 0 and a new row will be created for the same item, with QtyOnHand set to 1, indicating that the item has moved locations/sites. no modification/update necessary for intranet
  
  
*   5\. to supply the defaults for LotSerT, with appropriate values for LotSerNbr, LineNbr, LineRef, etc.
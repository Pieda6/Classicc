-- CLASSICCC doesn't sell kidswear: hide any kids products (kept, not deleted,
-- so past orders stay intact — remove them from Admin → Products if you like)
-- and move them out of the retired KIDS department.
UPDATE "Product" SET "active" = false, "gender" = 'UNISEX' WHERE "gender" = 'KIDS';

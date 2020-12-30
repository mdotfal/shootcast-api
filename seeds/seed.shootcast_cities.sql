TRUNCATE shootcast_cities RESTART IDENTITY CASCADE;

INSERT INTO shootcast_cities ( name, list_id )
VALUES
  ( 'San Francisco', 1 ),
  ( 'Fremont', 2 ),
  ( 'Walnut Creek', 2 ),
  ( 'Livermore', 1 ),
  ( 'Castro Valley', 1 ),
  ( 'Hayward', 4 ),
  ( 'San Jose', 4 ),
  ( 'Cupertino', 4 ),
  ( 'Stanford', 3 ),
  ( 'Oakland', 2 );
DROP TRIGGER IF EXISTS trg_savedroutes_after_delete;

DELIMITER //

CREATE TRIGGER trg_savedroutes_after_delete
AFTER DELETE ON savedroutes
FOR EACH ROW
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM savedroutes
    WHERE RouteId = OLD.RouteId
  ) THEN
    DELETE FROM routemetrics
    WHERE RouteId = OLD.RouteId;
  END IF;
END //

DELIMITER ;

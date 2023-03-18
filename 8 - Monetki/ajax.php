<?php
//phpinfo();
// $_POST    $_GET   $_REQUEST
// print_r($_POST);
// print_r($_GET);
// print_r($_REQUEST);
include("hidden.php"); //require
// mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$mysqli = new mysqli($host, $user, $passwd, $dbname);
$mysqli->query("set names utf8");

if (isset($_POST['req'])) {
    switch ($_POST['req']) {
        case 'getFlags':
            $sql = "SELECT * FROM flags";
            $result = $mysqli->query($sql);
            $all = $result->fetch_all();
            echo json_encode($all);
            break;
        case 'getAlloys':
            $sql = "SELECT * FROM alloys";
            $result = $mysqli->query($sql);
            $all = $result->fetch_all();
            echo json_encode($all);
            break;
        case 'getData':
            $sql = "SELECT flags.filename, data.denomination, data.cat_nr, alloys.name, data.year, data.id 
            FROM data 
            INNER JOIN flags ON data.flag_id = flags.id
            INNER JOIN alloys ON data.alloy_id = alloys.id";
            $result = $mysqli->query($sql);
            $all = $result->fetch_all();
            echo json_encode($all);
            break;
        case 'add':
            if (isset($_POST['alloy']) && isset($_POST['country'])) {
                echo "adding<br>";
                $alloy_id = "SELECT id FROM alloys WHERE name = ?";
                $alloy_name = rawurldecode($_POST['alloy']);
                $stmt = $mysqli->prepare($alloy_id);
                $stmt->bind_param("s", $alloy_name);
                $stmt->execute();
                $result1 = $stmt->get_result();

                $flag_id = "SELECT id FROM flags WHERE filename = ?";
                $flag_name = rawurldecode($_POST['country']) . ".jpg";
                $stmt = $mysqli->prepare($flag_id);
                $stmt->bind_param("s", $flag_name);
                $stmt->execute();
                $result2 = $stmt->get_result();

                if ($result1->num_rows > 0 && $result2->num_rows > 0) {
                    $alloy = $result1->fetch_assoc();
                    $flag = $result2->fetch_assoc();
                    $den = rawurldecode($_POST['den']);
                    $cat = rawurldecode($_POST['cat']);
                    $year = intval(rawurldecode($_POST['year']));
                    $sql = "INSERT INTO data(flag_id, alloy_id, denomination, cat_nr, year) 
                    VALUES(?, ?, ?, ?, ?)";
                    if ($stmt = $mysqli->prepare($sql)) {
                        $stmt->bind_param("iissi", $flag['id'], $alloy['id'], $den, $cat, $year);
                        $stmt->execute();
                        echo json_encode("added");
                    } else {
                        echo "Error while inserting";
                    }
                } else {
                    echo "Error: select didn't found correct id", $result1->num_rows, $result2->num_rows;
                }
            } else {
                echo "Error: alloy or country not set";
            }
            break;
        case 'update':
            if (isset($_POST['alloy']) && isset($_POST['country']) && isset($_POST['id'])) {
                echo "updating<br>";
                $alloy_id = "SELECT id FROM alloys WHERE name = ?";
                $alloy_name = rawurldecode($_POST['alloy']);
                $stmt = $mysqli->prepare($alloy_id);
                $stmt->bind_param("s", $alloy_name);
                $stmt->execute();
                $result1 = $stmt->get_result();

                $flag_id = "SELECT id FROM flags WHERE filename = ?";
                $flag_name = rawurldecode($_POST['country']) . ".jpg";
                $stmt = $mysqli->prepare($flag_id);
                $stmt->bind_param("s", $flag_name);
                $stmt->execute();
                $result2 = $stmt->get_result();

                if ($result1->num_rows > 0 && $result2->num_rows > 0) {
                    $alloy = $result1->fetch_assoc();
                    $flag = $result2->fetch_assoc();
                    $den = rawurldecode($_POST['den']);
                    $cat = rawurldecode($_POST['cat']);
                    $year = intval(rawurldecode($_POST['year']));
                    $id = intval(rawurldecode($_POST['id']));
                    $sql = "UPDATE data SET flag_id = ?,
                                            alloy_id = ?,
                                            denomination = ?,
                                            cat_nr = ?,
                                            year = ?
                    WHERE id = ?";
                    if ($stmt = $mysqli->prepare($sql)) {
                        $stmt->bind_param("iissii", $flag['id'], $alloy['id'], $den, $cat, $year, $id);
                        $stmt->execute();
                        echo json_encode("updated");
                    } else {
                        echo "Error while inserting";
                    }
                } else {
                    echo "Error: select didn't found correct id", $result1->num_rows, $result2->num_rows;
                }
            }
            break;
        case 'delete':
            if (isset($_POST['id'])) {
                if ($stmt = $mysqli->prepare("DELETE FROM data WHERE data.id = ?")) {
                    $id = intval(rawurldecode($_POST['id']));
                    $stmt->bind_param("i", $id);
                    $stmt->execute();
                    if ($err = $stmt->error) {
                        echo "Error while deleting: ", $err;
                    } else {
                        echo "Deleted: ", $_POST['id'];
                    }
                } else {
                    echo "Error while preparing to delete";
                }
            } else {
                echo "Error: id is not set";
            }
            break;
        default:
            echo "Unknown request: ", $_POST['req'];
            break;
    }
}

$mysqli->close();
?>
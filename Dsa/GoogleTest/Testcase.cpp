#include <gtest/gtest.h>
#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

// ============================================================
// SONG CLASS
// ============================================================
class Song {
public:
    int id;
    string name;
    string artist;
    Song* prev;
    Song* next;

    Song(int songId, const string& songName, const string& artistName)
        : id(songId),
          name(songName),
          artist(artistName),
          prev(this),
          next(this) {}
};

// ============================================================
// PLAYLIST CLASS
// ============================================================
class Playlist {
private:
    Song* head;
    Song* tail;
    Song* current;
    int songIdCounter;

public:
    Playlist()
        : head(nullptr),
          tail(nullptr),
          current(nullptr),
          songIdCounter(1) {}

    ~Playlist() {
        clear();
    }

    void clear() {
        if (!head) {
            return;
        }

        Song* temp = head->next;

        while (temp != head) {
            Song* nextNode = temp->next;
            delete temp;
            temp = nextNode;
        }

        delete head;

        head = nullptr;
        tail = nullptr;
        current = nullptr;
    }

    Song* getHead() const {
        return head;
    }

    Song* getTail() const {
        return tail;
    }

    Song* getCurrent() const {
        return current;
    }

    bool songExists(const string& name) const {
        if (!head) {
            return false;
        }

        Song* temp = head;

        do {
            if (temp->name == name) {
                return true;
            }

            temp = temp->next;

        } while (temp != head);

        return false;
    }

    bool addSong(const string& name, const string& artist) {

        if (head) {
            Song* temp = head;

            do {
                if (temp->name == name &&
                    temp->artist == artist) {
                    return false;
                }

                temp = temp->next;

            } while (temp != head);
        }

        Song* newSong =
            new Song(songIdCounter++, name, artist);

        if (!head) {
            head = tail = newSong;
        }
        else {
            newSong->prev = tail;
            newSong->next = head;

            tail->next = newSong;
            head->prev = newSong;

            tail = newSong;
        }

        return true;
    }

    bool deleteSong(const string& name,
                    const string& artist) {

        if (!head) {
            return false;
        }

        Song* temp = head;

        do {
            if (temp->name == name &&
                temp->artist == artist) {

                if (temp == current) {
                    current =
                        (temp->next == temp)
                        ? nullptr
                        : temp->next;
                }

                // Only one node
                if (head == tail) {
                    delete temp;
                    head = tail = current = nullptr;
                    return true;
                }

                // Delete head
                if (temp == head) {
                    head = head->next;

                    tail->next = head;
                    head->prev = tail;
                }
                // Delete tail
                else if (temp == tail) {
                    tail = tail->prev;

                    tail->next = head;
                    head->prev = tail;
                }
                // Delete middle node
                else {
                    temp->prev->next = temp->next;
                    temp->next->prev = temp->prev;
                }

                delete temp;
                return true;
            }

            temp = temp->next;

        } while (temp != head);

        return false;
    }

    bool renameSong(const string& oldName,
                    const string& oldArtist,
                    const string& newName,
                    const string& newArtist) {

        if (!head) {
            return false;
        }

        Song* temp = head;

        do {
            if (temp->name == oldName &&
                temp->artist == oldArtist) {

                temp->name = newName;
                temp->artist = newArtist;

                return true;
            }

            temp = temp->next;

        } while (temp != head);

        return false;
    }

    void sortPlaylist() {

        if (!head ||
            head == tail) {
            return;
        }

        Song* curr = head;

        while (curr != tail) {

            Song* minNode = curr;
            Song* temp = curr->next;

            while (temp != head) {

                if (temp->name <
                    minNode->name) {
                    minNode = temp;
                }

                temp = temp->next;
            }

            if (minNode != curr) {
                swap(curr->id, minNode->id);
                swap(curr->name, minNode->name);
                swap(curr->artist, minNode->artist);
            }

            curr = curr->next;
        }
    }

    void playTopSong() {
        if (head) {
            current = head;
        }
    }

    void playNextSong() {
        if (current) {
            current = current->next;
        }
    }

    void playPreviousSong() {
        if (current) {
            current = current->prev;
        }
    }
};

// ============================================================
// TEST FIXTURE
// ============================================================
class PlaylistTest : public ::testing::Test {
protected:
    Playlist playlist;
};

// ============================================================
// TEST CASES
// ============================================================

TEST_F(PlaylistTest, AddSongToEmptyPlaylist) {

    EXPECT_TRUE(
        playlist.addSong(
            "Bohemian Rhapsody",
            "Queen"));

    Song* head = playlist.getHead();

    ASSERT_NE(head, nullptr);

    EXPECT_EQ(
        head->name,
        "Bohemian Rhapsody");

    EXPECT_EQ(
        head->artist,
        "Queen");
}

TEST_F(PlaylistTest, AddDuplicateSongFails) {

    playlist.addSong(
        "Hotel California",
        "Eagles");

    EXPECT_FALSE(
        playlist.addSong(
            "Hotel California",
            "Eagles"));
}

TEST_F(PlaylistTest, AddMultipleSongsMaintainsLinks) {

    playlist.addSong(
        "Song A",
        "Artist A");

    playlist.addSong(
        "Song B",
        "Artist B");

    playlist.addSong(
        "Song C",
        "Artist C");

    Song* head = playlist.getHead();
    Song* tail = playlist.getTail();

    ASSERT_NE(head, nullptr);
    ASSERT_NE(tail, nullptr);

    EXPECT_EQ(head->prev, tail);
    EXPECT_EQ(tail->next, head);
}

TEST_F(PlaylistTest, DeleteExistingSong) {

    playlist.addSong("A", "Artist1");
    playlist.addSong("B", "Artist2");

    EXPECT_TRUE(
        playlist.deleteSong(
            "A",
            "Artist1"));
}

TEST_F(PlaylistTest, DeleteNonExistingSong) {

    playlist.addSong("A", "Artist1");

    EXPECT_FALSE(
        playlist.deleteSong(
            "XYZ",
            "Artist"));
}

TEST_F(PlaylistTest, RenameSong) {

    playlist.addSong(
        "Old Song",
        "Old Artist");

    EXPECT_TRUE(
        playlist.renameSong(
            "Old Song",
            "Old Artist",
            "New Song",
            "New Artist"));

    EXPECT_TRUE(
        playlist.songExists(
            "New Song"));
}

TEST_F(PlaylistTest, PlayNextSongWorks) {

    playlist.addSong("A", "Artist1");
    playlist.addSong("B", "Artist2");

    playlist.playTopSong();

    EXPECT_EQ(
        playlist.getCurrent()->name,
        "A");

    playlist.playNextSong();

    EXPECT_EQ(
        playlist.getCurrent()->name,
        "B");
}

TEST_F(PlaylistTest, PlayPreviousSongWorks) {

    playlist.addSong("A", "Artist1");
    playlist.addSong("B", "Artist2");

    playlist.playTopSong();
    playlist.playPreviousSong();

    EXPECT_EQ(
        playlist.getCurrent()->name,
        "B");
}

// ============================================================
// MAIN
// ============================================================
int main(int argc, char** argv)
{
    std::cout << "Starting Google Tests...\n";

    ::testing::InitGoogleTest(&argc, argv);

    int result = RUN_ALL_TESTS();

    std::cout << "\nTests Finished.\n";

    system("pause");

    return result;
}
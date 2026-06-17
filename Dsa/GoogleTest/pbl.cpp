#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

class Song {
public:
    int id;
    string name;
    string artist;
    Song* prev;
    Song* next;

    Song(int songId, string songName, string artistName) {
        id = songId;
        name = songName;
        artist = artistName;
        prev = this;
        next = this;
    }
};

class Playlist {
private:
    Song* head;
    Song* tail;
    Song* current;
    int songIdCounter;

public:
    Playlist() : head(nullptr), tail(nullptr), current(nullptr), songIdCounter(1) {}

    // Destructor added to prevent memory leaks during testing
    ~Playlist() {
        clear();
    }

    void clear() {
        if (!head) return;
        Song* temp = head;
        do {
            Song* nextNode = temp->next;
            delete temp;
            temp = nextNode;
        } while (temp != head);
        head = tail = current = nullptr;
    }

    // Getters for Testing Verification
    Song* getHead() const { return head; }
    Song* getTail() const { return tail; }
    Song* getCurrent() const { return current; }

    bool songExists(const string& name) {
        Song* temp = head;
        if (!temp) return false;
        do {
            if (temp->name == name) return true;
            temp = temp->next;
        } while (temp != head);
        return false;
    }

    // Refactored: Accepts string inputs instead of forcing 'cin'
    bool addSong(const string& name, const string& artist) {
        Song* temp = head;
        if (temp) {
            do {
                if (temp->name == name && temp->artist == artist) {
                    return false; // Duplicate
                }
                temp = temp->next;
            } while (temp != head);
        }

        Song* newSong = new Song(songIdCounter++, name, artist);
        if (!head) {
            head = tail = newSong;
        } else {
            tail->next = newSong;
            newSong->prev = tail;
            tail = newSong;
        }
        tail->next = head;
        head->prev = tail;
        return true;
    }

    bool deleteSong(const string& name, const string& artist) {
        if (!head) return false;
        Song* temp = head;

        do {
            if (temp->name == name && temp->artist == artist) {
                if (current == temp) current = temp->next == temp ? nullptr : temp->next;
                
                if (temp == head && temp == tail) {
                    head = tail = nullptr;
                } else if (temp == head) {
                    head = head->next;
                    head->prev = tail;
                    tail->next = head;
                } else if (temp == tail) {
                    tail = tail->prev;
                    tail->next = head;
                    head->prev = tail;
                } else {
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

    bool renameSong(const string& oldName, const string& oldArtist, const string& newName, const string& newArtist) {
        if (!head) return false;
        
        Song* temp = head;
        do {
            if (temp->name == oldName && temp->artist == oldArtist) {
                if (songExists(newName) && newName != oldName) {
                    return false; // Collision with another song
                }
                temp->name = newName;
                temp->artist = newArtist;
                return true;
            }
            temp = temp->next;
        } while (temp != head);

        return false;
    }

    void sortPlaylist() {
        if (!head || !head->next || head->next == head) return;

        Song* currNode = head;
        while (currNode != tail) {
            Song* minNode = currNode;
            Song* temp = currNode->next;

            while (temp != head) {
                if (temp->name < minNode->name) {
                    minNode = temp;
                }
                temp = temp->next;
            }

            if (minNode != currNode) {
                swap(currNode->name, minNode->name);
                swap(currNode->artist, minNode->artist);
                swap(currNode->id, minNode->id); // IDs should swap alongside records
            }
            currNode = currNode->next;
        }
    }

    void playTopSong() { if (head) current = head; }
    void playNextSong() { if (current) current = current->next; }
    void playPreviousSong() { if (current) current = current->prev; }
};